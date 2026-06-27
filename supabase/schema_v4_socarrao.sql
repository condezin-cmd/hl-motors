-- ============================================================
-- HL Motors - Migração v4: integração SóCarrão
-- Rode no SQL Editor do Supabase (uma vez). Aditivo e seguro.
-- ============================================================

alter table public.veiculos add column if not exists socarrao_id bigint unique;
alter table public.veiculos add column if not exists socarrao_status text;
alter table public.veiculos add column if not exists socarrao_last_sync_at timestamptz;
alter table public.veiculos add column if not exists socarrao_payload jsonb not null default '{}'::jsonb;

create index if not exists veiculos_socarrao_id_idx on public.veiculos (socarrao_id);
create index if not exists veiculos_placa_idx on public.veiculos (placa);

create table if not exists public.integracoes_anuncios (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  provider text not null,
  veiculo_id uuid references public.veiculos(id) on delete cascade,
  external_id text,
  status text not null default 'pendente',
  last_payload jsonb not null default '{}'::jsonb,
  last_error text
);

create unique index if not exists integracoes_anuncios_provider_veiculo_idx
  on public.integracoes_anuncios (provider, veiculo_id);

alter table public.integracoes_anuncios enable row level security;

drop policy if exists "integracoes_anuncios_all_auth" on public.integracoes_anuncios;
create policy "integracoes_anuncios_all_auth"
  on public.integracoes_anuncios for all to authenticated
  using (true) with check (true);

drop trigger if exists integracoes_anuncios_touch on public.integracoes_anuncios;
create trigger integracoes_anuncios_touch before update on public.integracoes_anuncios
  for each row execute function public.touch_updated_at();
