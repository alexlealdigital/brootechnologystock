-- ============================================================================
-- BrooStock — passo 3 (emergência): DESFAZER o passo 002
-- Remove só as regras "exige_licenca". As regras originais continuam intactas.
-- Use se algum cliente pagante ficar sem acesso por falha de sincronização.
-- ============================================================================
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where policyname like '%\_exige\_licenca%' escape '\'
  loop
    execute format('drop policy if exists %I on %I.%I;', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

select count(*) as regras_restantes from pg_policies where policyname like '%exige_licenca%';
