-- ============================================================
-- HL Motors — Migração v2: arquivos (documentos anexados) + origem
-- Rode no SQL Editor do Supabase (uma vez). É aditivo e seguro.
-- ============================================================

-- Documentos/arquivos anexados (CRLV, RG, comprovante, etc.)
alter table public.veiculos add column if not exists arquivos jsonb not null default '[]'::jsonb;
alter table public.clientes add column if not exists arquivos jsonb not null default '[]'::jsonb;

-- Como o veículo entrou no estoque (compra direta, consignação ou troca)
alter table public.veiculos add column if not exists origem text not null default 'compra';

-- Veículo recebido como parte do pagamento (troca) numa venda
alter table public.vendas add column if not exists troca_marca text;
alter table public.vendas add column if not exists troca_modelo text;
alter table public.vendas add column if not exists troca_ano text;
alter table public.vendas add column if not exists troca_placa text;
alter table public.vendas add column if not exists troca_valor numeric(12,2);
alter table public.vendas add column if not exists entrada_valor numeric(12,2);

-- ---------- Bucket privado para documentos anexados ----------
insert into storage.buckets (id, name, public) values ('arquivos','arquivos', false)
  on conflict (id) do nothing;

-- só autenticado acessa (são documentos sensíveis: RG/CPF/CRLV)
drop policy if exists "arquivos_auth_all" on storage.objects;
create policy "arquivos_auth_all" on storage.objects for all to authenticated
  using (bucket_id = 'arquivos') with check (bucket_id = 'arquivos');
