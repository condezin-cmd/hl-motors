-- HL Motors - Migração v5: Financeiro (livro caixa)
create table if not exists public.lancamentos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  data date not null default current_date,
  tipo text not null,                 -- entrada | saida
  categoria text not null,            -- venda | comissao_consignacao | comissao_financeira | aporte_socio | custo_veiculo | reparo | repasse_consignante | gasto_fixo | retirada_socio | outra_entrada | outra_saida
  descricao text,
  valor numeric(12,2) not null default 0,
  veiculo_id uuid references public.veiculos(id) on delete set null,
  negociacao_id uuid references public.negociacoes(id) on delete set null,
  socio text,
  forma_pagamento text,
  auto boolean not null default false  -- gerado automaticamente (ex.: ao fechar venda)
);

create index if not exists lancamentos_data_idx on public.lancamentos (data desc);
create index if not exists lancamentos_categoria_idx on public.lancamentos (categoria);
create index if not exists lancamentos_veiculo_idx on public.lancamentos (veiculo_id);
create index if not exists lancamentos_negociacao_idx on public.lancamentos (negociacao_id);

alter table public.lancamentos enable row level security;
drop policy if exists "lancamentos_all_auth" on public.lancamentos;
create policy "lancamentos_all_auth" on public.lancamentos for all to authenticated using (true) with check (true);

drop trigger if exists lancamentos_touch on public.lancamentos;
create trigger lancamentos_touch before update on public.lancamentos
  for each row execute function public.touch_updated_at();

notify pgrst, 'reload schema';
