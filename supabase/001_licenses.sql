-- ============================================================================
-- BrooStock (projeto Supabase icazserwvgkiertzboww) — passo 1 de 3
-- Tabela de licenças espelhada pelo backend da BrooStore.
--
-- É SEGURO rodar agora: só cria tabela e função, não muda o acesso de ninguém.
-- Rodar no SQL Editor do projeto do BROOSTOCK (não no da BrooStore!).
-- ============================================================================

create table if not exists public.licenses (
  email      text primary key,                 -- sempre minúsculo (o backend normaliza)
  ativa      boolean not null default false,
  plano      text,
  is_trial   boolean not null default false,
  expira_em  timestamptz,                      -- NULL = sem vencimento
  updated_at timestamptz not null default now()
);

alter table public.licenses enable row level security;

-- Só o backend (service_role, que ignora RLS) escreve aqui.
-- O usuário logado só consegue LER a própria linha.
drop policy if exists licenses_select_own on public.licenses;
create policy licenses_select_own on public.licenses
  for select to authenticated
  using (email = lower(auth.jwt() ->> 'email'));

-- Usada pelas regras do passo 2. Sem SECURITY DEFINER de propósito: quem
-- chama só enxerga a própria linha, então não dá para sondar o e-mail de outro.
create or replace function public.has_active_license(p_email text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.licenses
    where email = lower(p_email)
      and ativa = true
      and (expira_em is null or expira_em > now())
  );
$$;

-- Conferência: a tabela existe, está vazia e com RLS ligada.
select relname, relrowsecurity from pg_class where relname = 'licenses';
select count(*) as linhas from public.licenses;
