-- HL Motors - Migração v6: gastos fixos recorrentes
create table if not exists public.gastos_fixos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  nome text not null,
  valor numeric(12,2) not null default 0,
  dia_vencimento int,
  ativo boolean not null default true,
  observacao text
);
alter table public.gastos_fixos enable row level security;
drop policy if exists "gastos_fixos_all_auth" on public.gastos_fixos;
create policy "gastos_fixos_all_auth" on public.gastos_fixos for all to authenticated using (true) with check (true);
drop trigger if exists gastos_fixos_touch on public.gastos_fixos;
create trigger gastos_fixos_touch before update on public.gastos_fixos for each row execute function public.touch_updated_at();

alter table public.lancamentos add column if not exists gasto_fixo_id uuid references public.gastos_fixos(id) on delete set null;
alter table public.lancamentos add column if not exists competencia text;
create index if not exists lancamentos_competencia_idx on public.lancamentos (competencia);
notify pgrst, 'reload schema';
