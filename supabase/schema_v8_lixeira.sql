-- ============================================================
-- v8 — Lixeira (soft delete reversível por snapshot)
-- ============================================================
-- Excluir move o registro para cá (some das listas na hora). De onde pode ser
-- restaurado (volta com o mesmo id) ou excluído em definitivo.

create table if not exists public.lixeira (
  id uuid primary key default gen_random_uuid(),
  tabela text not null,          -- veiculos | leads | documentos | clientes | negociacoes | avaliacoes | lancamentos | gastos_fixos
  registro_id uuid not null,
  rotulo text,                   -- descrição legível
  dados jsonb not null,          -- snapshot completo da linha
  deleted_at timestamptz not null default now(),
  deleted_by text
);
create index if not exists lixeira_tabela_idx on public.lixeira (tabela);
create index if not exists lixeira_deleted_idx on public.lixeira (deleted_at desc);

alter table public.lixeira enable row level security;
create policy "lixeira_rw_auth" on public.lixeira for all to authenticated using (true) with check (true);
