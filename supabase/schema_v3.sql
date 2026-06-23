-- ============================================================
-- HL Motors — Migração v3: AVALIAÇÕES (carro como parte de pagamento)
-- Processo: cliente traz o carro -> registra avaliação (com valor) ->
-- só então pode entrar como troca na venda.
-- Rode no SQL Editor do Supabase (uma vez). Aditivo e seguro.
-- ============================================================

create table if not exists public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  cliente_id uuid references public.clientes(id) on delete set null,
  marca text,
  modelo text,
  versao text,
  ano_fab int,
  ano_modelo int,
  km int,
  placa text,
  renavam text,
  chassi text,
  cor text,
  combustivel text,
  estado text,                  -- condição geral (descrição)
  valor_avaliado numeric(12,2), -- valor considerado na negociação
  valor_fipe numeric(12,2),
  observacoes text,
  fotos jsonb not null default '[]'::jsonb,
  arquivos jsonb not null default '[]'::jsonb,
  status text not null default 'avaliado', -- avaliado | aceito | recusado | usado
  veiculo_estoque_id uuid references public.veiculos(id) on delete set null
);
create index if not exists avaliacoes_cliente_idx on public.avaliacoes (cliente_id);
create index if not exists avaliacoes_status_idx on public.avaliacoes (status);

alter table public.avaliacoes enable row level security;
drop policy if exists "avaliacoes_all_auth" on public.avaliacoes;
create policy "avaliacoes_all_auth" on public.avaliacoes
  for all to authenticated using (true) with check (true);

-- liga a venda à avaliação usada na troca
alter table public.vendas add column if not exists avaliacao_id uuid references public.avaliacoes(id) on delete set null;
