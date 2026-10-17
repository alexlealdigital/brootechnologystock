-- ============================================================================
-- BrooStock — passo 2 de 3: EXIGIR LICENÇA ATIVA no banco
--
-- >>> NÃO RODE ANTES de:
--       a) o passo 001 ter sido rodado;
--       b) o backend novo estar no ar com BROOSTOCK_SUPABASE_URL e
--          BROOSTOCK_SUPABASE_SERVICE_KEY configuradas no Render;
--       c) `python sincronizar_licencas_app.py` (ou `... broostock`) ter sido executado
--          (carrega as licenças que já existem);
--       d) a CONFERÊNCIA 1 abaixo listar apenas quem realmente não tem
--          licença vigente.
--     Rodar antes disso trava o acesso de TODOS os clientes, inclusive quem pagou.
--
-- Como funciona: em vez de reescrever as regras que já existem, soma uma regra
-- RESTRITIVA em cada tabela. Regra restritiva é combinada com "E" às regras
-- atuais: o dono continua precisando ser o dono (user_id = auth.uid()) E agora
-- também precisa ter licença vigente. Desfazer = rodar o passo 003.
-- ============================================================================

-- CONFERÊNCIA 1 — quem vai ficar sem acesso depois deste passo?
-- (rode só este SELECT primeiro e leia o resultado)
select u.email,
       l.plano, l.is_trial, l.expira_em
from auth.users u
left join public.licenses l on l.email = lower(u.email)
where not coalesce(l.ativa and (l.expira_em is null or l.expira_em > now()), false)
order by u.created_at desc;

-- ----------------------------------------------------------------------------
-- TRAVA DE SEGURANÇA — se a tabela licenses estiver vazia, a carga inicial
-- (python sincronizar_licencas_app.py) ainda não foi feita: rodar o resto
-- bloquearia TODOS os clientes. O script aborta aqui e NADA é alterado.
-- ----------------------------------------------------------------------------
do $$
begin
  if (select count(*) from public.licenses) = 0 then
    raise exception 'ABORTADO: a tabela licenses esta vazia. Faca antes a carga inicial (python sincronizar_licencas_app.py no Render). Nada foi alterado.';
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- Regra restritiva nas tabelas do usuário (tudo bloqueado sem licença vigente)
-- ----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['movements', 'payment_settings', 'entities', 'channels', 'categories'] loop
    execute format('drop policy if exists %I_exige_licenca on public.%I;', t, t);
    execute format($f$
      create policy %I_exige_licenca on public.%I
        as restrictive
        for all
        to authenticated
        using (public.has_active_license(auth.jwt() ->> 'email'))
        with check (public.has_active_license(auth.jwt() ->> 'email'));
    $f$, t, t);
  end loop;
end $$;

-- products: a vitrine pública (/loja) precisa continuar visível para todos,
-- então a LEITURA tem uma exceção para produtos publicados. Escrita não.
drop policy if exists products_exige_licenca_select on public.products;
create policy products_exige_licenca_select on public.products
  as restrictive
  for select
  to authenticated
  using (
    public.has_active_license(auth.jwt() ->> 'email')
    or (is_published = true and is_visible_on_site = true)
  );

drop policy if exists products_exige_licenca_insert on public.products;
create policy products_exige_licenca_insert on public.products
  as restrictive for insert to authenticated
  with check (public.has_active_license(auth.jwt() ->> 'email'));

drop policy if exists products_exige_licenca_update on public.products;
create policy products_exige_licenca_update on public.products
  as restrictive for update to authenticated
  using (public.has_active_license(auth.jwt() ->> 'email'))
  with check (public.has_active_license(auth.jwt() ->> 'email'));

drop policy if exists products_exige_licenca_delete on public.products;
create policy products_exige_licenca_delete on public.products
  as restrictive for delete to authenticated
  using (public.has_active_license(auth.jwt() ->> 'email'));

-- contacts: o formulário da vitrine continua aberto (insert público). Só a
-- leitura/edição/exclusão pelo dono passam a exigir licença.
drop policy if exists contacts_exige_licenca_leitura on public.contacts;
create policy contacts_exige_licenca_leitura on public.contacts
  as restrictive
  for select
  to authenticated
  using (public.has_active_license(auth.jwt() ->> 'email'));

drop policy if exists contacts_exige_licenca_edicao on public.contacts;
create policy contacts_exige_licenca_edicao on public.contacts
  as restrictive
  for update
  to authenticated
  using (public.has_active_license(auth.jwt() ->> 'email'))
  with check (public.has_active_license(auth.jwt() ->> 'email'));

drop policy if exists contacts_exige_licenca_exclusao on public.contacts;
create policy contacts_exige_licenca_exclusao on public.contacts
  as restrictive
  for delete
  to authenticated
  using (public.has_active_license(auth.jwt() ->> 'email'));

-- CONFERÊNCIA 2 — as regras novas existem
select tablename, policyname, permissive, cmd
from pg_policies
where policyname like '%exige_licenca%'
order by tablename, policyname;
