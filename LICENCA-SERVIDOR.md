# Por que o gate de licença ainda não é 100% à prova de bypass

## O problema, em uma frase

Hoje, `App.tsx`/`LicenseRequired.tsx` só decidem **o que mostrar na tela** com
base numa chamada HTTP para `mercadopago-final.onrender.com`. O acesso real
aos dados (Supabase) é liberado só pelo login (`auth.uid()`), não pela
assinatura. Ou seja: um usuário com trial vencido ou sem plano ativo consegue
abrir o console do navegador (F12) e usar `window.supabase` — que já está
carregado na página, com a sessão dele — para ler/gravar produtos e
movimentações diretamente, sem passar pela tela de "Licença necessária".

Isso **não dá pra resolver só neste repositório**, porque a informação de
"quem pagou" mora no banco do BrooStore (outro serviço, outro repo), não no
Supabase do BrooStock. Este documento explica o porquê e o caminho recomendado.

## Três formas de fechar isso, do mais simples ao mais robusto

### Opção A — Tabela de licenças sincronizada (recomendada para começar)

1. Criar uma tabela `licenses` no Supabase do BrooStock (email, ativa,
   plano, expira_em) — script pronto abaixo.
2. O **BrooStore precisa chamar essa tabela** (via `supabase-py`/REST, com a
   `service_role key`) sempre que uma licença for ativada, renovada ou
   expirar — no mesmo lugar do código dele que já confirma pagamento e
   ativa trial. Isso é uma mudança pequena, mas fica **fora deste
   repositório** (BrooStock), então eu não consigo aplicá-la sem acesso ao
   repo do BrooStore/mercadopago-final.
3. Trocar as políticas de RLS de `products`/`movements`/etc. para também
   exigir `has_active_license(auth.email())`, não só `auth.uid()`.

Vantagem: simples, sem tocar em Edge Functions. Desvantagem: só fica
correto no instante em que o BrooStore realmente escrever nessa tabela —
até lá, ativar a RLS mais estrita **derrubaria o acesso de todo mundo**
(inclusive quem pagou). Por isso o SQL desta opção está separado do
`SUPABASE_SETUP.sql` principal — **não rode a parte de RLS abaixo antes de
o BrooStore estar escrevendo na tabela `licenses`.**

```sql
-- Rode isto a qualquer momento (só cria a tabela, não muda nada em produção):
create table if not exists public.licenses (
  email text primary key,
  ativa boolean not null default false,
  plano text,
  is_trial boolean not null default false,
  expira_em timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.licenses enable row level security;
-- Só o backend (service_role) escreve aqui; o próprio usuário pode ler a sua.
drop policy if exists licenses_select_own on public.licenses;
create policy licenses_select_own on public.licenses
  for select to authenticated
  using (email = auth.jwt() ->> 'email');

create or replace function public.has_active_license(p_email text)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.licenses
    where email = p_email and ativa = true
      and (expira_em is null or expira_em > now())
  );
$$;

-- SÓ RODE ISTO DEPOIS que o BrooStore estiver alimentando "licenses":
-- (troca a policy de SELECT de products para também exigir licença ativa)
--
-- drop policy if exists products_select_own on public.products;
-- create policy products_select_own on public.products
--   for select to authenticated
--   using (user_id = auth.uid() and public.has_active_license(auth.jwt() ->> 'email'));
--
-- (repita o padrão "and public.has_active_license(...)" nas policies de
--  insert/update/delete de products, movements, entities, channels,
--  categories, payment_settings — ou centralize numa função e chame ela
--  em todas.)
```

### Opção B — Edge Function como "porteiro"

Uma Supabase Edge Function que o frontend chama antes de qualquer ação
sensível, que por sua vez consulta o BrooStore server-to-server (evita
expor a lógica de licença no navegador). Mais robusto que a Opção A porque
não depende de um webhook do BrooStore ficar sempre em dia — a checagem é
"ao vivo" — mas adiciona uma chamada de rede extra em cada ação e exige
manter uma função separada.

### Opção C — JWT customizado com claim de licença

O BrooStore assina um token próprio (ou usa Custom Claims do Supabase Auth)
contendo `licenca_ativa: true/false` no momento do login, e a RLS lê esse
claim direto do JWT (`auth.jwt() ->> 'licenca_ativa'`), sem consulta
adicional a cada request. É o caminho mais robusto e mais rápido em
runtime, mas é o que exige mais mudança arquitetural nos dois lados
(BrooStock e BrooStore) — normalmente vale a pena só depois que a Opção A
já estiver rodando e você quiser reduzir a dependência de sincronização.

## O que eu já fiz e o que falta

- ✅ Deixei a tabela `licenses` e a função `has_active_license` prontas
  (bloco SQL acima), seguras para rodar agora — elas não mudam nenhum
  comportamento existente até a RLS ser trocada.
- ✅ Documentei aqui a mudança que falta no lado do BrooStore.
- ❌ Não ativei a RLS que exige licença — ativar agora, sem o BrooStore
  alimentando a tabela, bloquearia o acesso de todos os seus clientes,
  inclusive os que pagaram. Isso precisa ser feito coordenado com o deploy
  do BrooStore.

Se você me der acesso ao repositório do BrooStore (ou do serviço
`mercadopago-final`), eu consigo implementar o lado que falta e então
ativar a RLS com segurança.
