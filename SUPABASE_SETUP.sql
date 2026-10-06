-- =============================================================================
-- BrooStock — Script de correções para colar no Supabase SQL Editor
-- =============================================================================
-- Este script é IDEMPOTENTE: pode ser executado mais de uma vez sem quebrar
-- nada (usa IF NOT EXISTS / CREATE OR REPLACE / DROP ... IF EXISTS em tudo).
-- Não apaga nenhuma linha de dado existente.
--
-- O que ele resolve:
--   1) Baixa/entrada automática de estoque ao registrar uma movimentação
--      (hoje o campo "quantity" do produto não muda sozinho — o app conta
--      com o usuário editar manualmente, o que gera divergência).
--   2) Colunas que a tela "Loja" (StoreCatalog/PublishButton) já usa no
--      código mas podem não existir ainda na tabela products.
--   3) Trigger que preenche o "dono" (user_id) de um contato recebido pela
--      loja pública automaticamente a partir do produto — hoje esse dado
--      vinha da sessão de quem estava DE FORA olhando a loja, então o lead
--      nunca chegava pro vendedor certo.
--   4) Uma base de Row Level Security (RLS) para todas as tabelas usadas
--      pelo app — pra revisar/comparar com o que já está configurado no
--      seu projeto. Rode a SEÇÃO 4 com atenção: se você já tem políticas
--      customizadas, dê uma conferida antes de rodar (ela recria as
--      políticas com os nomes abaixo; políticas com outros nomes não são
--      tocadas, o que pode deixar regras antigas e novas coexistindo).
--
-- Rode as seções na ordem. Cada uma tem um comentário explicando o que faz.
-- =============================================================================


-- =============================================================================
-- SEÇÃO 1 — Colunas que a "Loja" (vitrine pública) e o cadastro de produtos
-- usam no código mas podem não existir na tabela ainda.
-- =============================================================================

alter table public.products
  add column if not exists barcode text,
  add column if not exists unit text default 'un',
  add column if not exists image_url text,
  add column if not exists tags text[] default '{}',
  add column if not exists is_published boolean default false,
  add column if not exists is_visible_on_site boolean default false,
  add column if not exists site_title text,
  add column if not exists site_description text,
  add column if not exists site_slug text,
  add column if not exists site_order integer default 0,
  add column if not exists sale_price numeric,
  add column if not exists published_at timestamptz;

alter table public.movements
  add column if not exists entity_id uuid,
  add column if not exists channel_id uuid;

-- Índice usado pelo filtro de baixo estoque e pela vitrine pública
create index if not exists idx_products_user_id on public.products (user_id);
create index if not exists idx_products_published on public.products (user_id, is_published, is_visible_on_site);
create index if not exists idx_movements_user_id on public.movements (user_id);
create index if not exists idx_movements_product_id on public.movements (product_id);
create index if not exists idx_contacts_user_id on public.contacts (user_id);


-- =============================================================================
-- SEÇÃO 2 — Baixa/entrada automática de estoque
-- =============================================================================
-- Sempre que uma linha é inserida, alterada ou apagada em "movements", esta
-- trigger ajusta o "quantity" do produto correspondente:
--   - type = 'entrada'  → soma a quantidade ao estoque
--   - type = 'saida'    → subtrai a quantidade do estoque
--
-- É executada DENTRO da mesma transação do INSERT/UPDATE/DELETE (atômico) e
-- usa "select ... for update" para travar a linha do produto — segura contra
-- duas movimentações concorrentes no mesmo produto.
--
-- Por padrão, a função IMPEDE que o estoque fique negativo (bloqueia a
-- movimentação com um erro claro). Se isso não fizer sentido pro seu
-- negócio (ex.: você quer permitir venda em backorder), comente as duas
-- linhas marcadas com "-- [GUARDA DE ESTOQUE NEGATIVO]" abaixo.

create or replace function public.fn_adjust_product_stock()
returns trigger
language plpgsql
security invoker
as $$
declare
  v_old_delta numeric := 0;
  v_new_delta numeric := 0;
  v_current_qty numeric;
  v_product_name text;
begin
  if tg_op = 'INSERT' then
    v_new_delta := case when new.type = 'entrada' then new.quantity else -new.quantity end;

    select quantity, name into v_current_qty, v_product_name
      from public.products where id = new.product_id for update;

    if v_current_qty is null then
      return new; -- produto não encontrado/sem permissão: não bloqueia o registro da movimentação
    end if;

    if v_current_qty + v_new_delta < 0 then -- [GUARDA DE ESTOQUE NEGATIVO]
      raise exception 'Estoque insuficiente para "%": disponível % un., tentativa de retirar % un.',
        coalesce(v_product_name, 'produto'), v_current_qty, new.quantity;
    end if;

    update public.products set quantity = quantity + v_new_delta, updated_at = now()
      where id = new.product_id;

    return new;

  elsif tg_op = 'UPDATE' then
    v_old_delta := case when old.type = 'entrada' then old.quantity else -old.quantity end;
    v_new_delta := case when new.type = 'entrada' then new.quantity else -new.quantity end;

    if old.product_id = new.product_id then
      select quantity, name into v_current_qty, v_product_name
        from public.products where id = new.product_id for update;

      if v_current_qty is not null then
        if v_current_qty - v_old_delta + v_new_delta < 0 then -- [GUARDA DE ESTOQUE NEGATIVO]
          raise exception 'Estoque insuficiente para "%": disponível % un.',
            coalesce(v_product_name, 'produto'), v_current_qty;
        end if;
        update public.products set quantity = quantity - v_old_delta + v_new_delta, updated_at = now()
          where id = new.product_id;
      end if;
    else
      -- produto foi trocado na edição: devolve o estoque ao produto antigo
      -- e debita do novo
      update public.products set quantity = quantity - v_old_delta, updated_at = now()
        where id = old.product_id;

      select quantity, name into v_current_qty, v_product_name
        from public.products where id = new.product_id for update;

      if v_current_qty is not null then
        if v_current_qty + v_new_delta < 0 then -- [GUARDA DE ESTOQUE NEGATIVO]
          raise exception 'Estoque insuficiente para "%": disponível % un.',
            coalesce(v_product_name, 'produto'), v_current_qty;
        end if;
        update public.products set quantity = quantity + v_new_delta, updated_at = now()
          where id = new.product_id;
      end if;
    end if;

    return new;

  elsif tg_op = 'DELETE' then
    v_old_delta := case when old.type = 'entrada' then old.quantity else -old.quantity end;
    update public.products set quantity = quantity - v_old_delta, updated_at = now()
      where id = old.product_id;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_adjust_product_stock on public.movements;
create trigger trg_adjust_product_stock
  after insert or update or delete on public.movements
  for each row execute function public.fn_adjust_product_stock();


-- =============================================================================
-- SEÇÃO 3 — Contato da loja sempre vai pro dono certo do produto
-- =============================================================================
-- Antes desta trigger, o app gravava em contacts.user_id o id de quem
-- estava VISITANDO a loja (ou um UUID zerado, se anônimo) — ou seja, o
-- lead nunca aparecia pro vendedor dono do produto. Esta trigger ignora
-- qualquer user_id que venha do cliente e sempre usa o dono real do
-- product_id informado.

create or replace function public.fn_set_contact_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select user_id into new.user_id from public.products where id = new.product_id;

  if new.user_id is null then
    raise exception 'Produto informado não existe (product_id inválido).';
  end if;

  if new.status is null then
    new.status := 'new';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_set_contact_owner on public.contacts;
create trigger trg_set_contact_owner
  before insert on public.contacts
  for each row execute function public.fn_set_contact_owner();

-- Esta função precisa de SECURITY DEFINER porque um visitante anônimo da
-- loja (sem sessão logada) não tem permissão de SELECT em "products" além
-- dos produtos publicados — mas aqui a leitura é só para descobrir o dono,
-- então é seguro e restrito a essa única finalidade.


-- =============================================================================
-- SEÇÃO 4 — Row Level Security (RLS)
-- =============================================================================
-- Revise antes de rodar se você já tem políticas próprias. Os nomes abaixo
-- são todos prefixados (ex.: "products_select_own") para não colidir com
-- políticas que você já tenha com outros nomes — mas isso também significa
-- que políticas antigas continuam ativas em paralelo a estas. Se quiser
-- substituir de vez, apague as antigas antes (Database → Policies no painel
-- do Supabase, ou "drop policy nome_antigo on public.tabela;").

-- --- products ---------------------------------------------------------------
alter table public.products enable row level security;

drop policy if exists products_select_own on public.products;
create policy products_select_own on public.products
  for select to authenticated
  using (user_id = auth.uid());

-- Necessária para a vitrine pública "/loja/:sellerId" funcionar sem login
drop policy if exists products_select_published on public.products;
create policy products_select_published on public.products
  for select to anon, authenticated
  using (is_published = true and is_visible_on_site = true);

drop policy if exists products_insert_own on public.products;
create policy products_insert_own on public.products
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists products_update_own on public.products;
create policy products_update_own on public.products
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists products_delete_own on public.products;
create policy products_delete_own on public.products
  for delete to authenticated
  using (user_id = auth.uid());

-- --- movements ---------------------------------------------------------------
alter table public.movements enable row level security;

drop policy if exists movements_select_own on public.movements;
create policy movements_select_own on public.movements
  for select to authenticated using (user_id = auth.uid());

drop policy if exists movements_insert_own on public.movements;
create policy movements_insert_own on public.movements
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists movements_update_own on public.movements;
create policy movements_update_own on public.movements
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists movements_delete_own on public.movements;
create policy movements_delete_own on public.movements
  for delete to authenticated using (user_id = auth.uid());

-- --- payment_settings, entities, channels, categories (mesmo padrão) --------
do $$
declare
  t text;
begin
  foreach t in array array['payment_settings', 'entities', 'channels', 'categories'] loop
    execute format('alter table public.%I enable row level security;', t);

    execute format('drop policy if exists %I_select_own on public.%I;', t, t);
    execute format('create policy %I_select_own on public.%I for select to authenticated using (user_id = auth.uid());', t, t);

    execute format('drop policy if exists %I_insert_own on public.%I;', t, t);
    execute format('create policy %I_insert_own on public.%I for insert to authenticated with check (user_id = auth.uid());', t, t);

    execute format('drop policy if exists %I_update_own on public.%I;', t, t);
    execute format('create policy %I_update_own on public.%I for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());', t, t);

    execute format('drop policy if exists %I_delete_own on public.%I;', t, t);
    execute format('create policy %I_delete_own on public.%I for delete to authenticated using (user_id = auth.uid());', t, t);
  end loop;
end $$;

-- --- contacts ------------------------------------------------------------
-- Qualquer pessoa (mesmo sem login) pode enviar uma mensagem pela loja —
-- mas o user_id é sempre sobrescrito pela trigger da SEÇÃO 3, nunca pelo
-- valor enviado pelo cliente. Só o dono do produto pode ler/atualizar/apagar.
alter table public.contacts enable row level security;

drop policy if exists contacts_insert_public on public.contacts;
create policy contacts_insert_public on public.contacts
  for insert to anon, authenticated
  with check (product_id is not null);

drop policy if exists contacts_select_own on public.contacts;
create policy contacts_select_own on public.contacts
  for select to authenticated using (user_id = auth.uid());

drop policy if exists contacts_update_own on public.contacts;
create policy contacts_update_own on public.contacts
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists contacts_delete_own on public.contacts;
create policy contacts_delete_own on public.contacts
  for delete to authenticated using (user_id = auth.uid());


-- =============================================================================
-- SEÇÃO 5 (opcional) — Storage: bucket "product-images"
-- =============================================================================
-- O upload de imagem de produto grava em product-images/<user_id>/arquivo.ext
-- e usa getPublicUrl (leitura pública). Ajuste/pule esta seção se o bucket já
-- estiver configurado do seu jeito.

-- drop policy if exists product_images_insert_own on storage.objects;
-- create policy product_images_insert_own on storage.objects
--   for insert to authenticated
--   with check (
--     bucket_id = 'product-images'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );
--
-- drop policy if exists product_images_public_read on storage.objects;
-- create policy product_images_public_read on storage.objects
--   for select to anon, authenticated
--   using (bucket_id = 'product-images');


-- =============================================================================
-- Fim do script.
-- =============================================================================
