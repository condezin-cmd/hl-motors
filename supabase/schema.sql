-- ============================================================
-- HL Motors — Área do Lojista · Schema Supabase
-- Rode no SQL Editor do Supabase (uma vez).
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Perfis (vinculados ao Supabase Auth) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  role text not null default 'lojista', -- lojista | admin
  created_at timestamptz not null default now()
);

-- cria profile automático quando um usuário se registra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', new.email))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Clientes ----------
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  nome text not null,
  cpf text,
  rg text,
  orgao_emissor text,
  data_nascimento date,
  nacionalidade text default 'Brasileiro(a)',
  estado_civil text,
  profissao text,
  telefone text,
  email text,
  -- endereço
  cep text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  uf text,
  observacoes text
);
create index if not exists clientes_nome_idx on public.clientes (nome);
create index if not exists clientes_cpf_idx on public.clientes (cpf);

-- ---------- Veículos (estoque) ----------
create table if not exists public.veiculos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  marca text not null,
  modelo text not null,
  versao text,
  ano_modelo int,
  ano_fab int,
  km int default 0,
  preco numeric(12,2) default 0,
  cambio text,        -- Manual | Automático | Automatizado | CVT
  combustivel text,   -- Flex | Gasolina | Diesel | Híbrido | Elétrico
  cor text,
  portas int default 4,
  placa text,
  renavam text,
  chassi text,
  status text not null default 'disponivel', -- disponivel | reservado | vendido | consignado
  destaque boolean not null default false,
  descricao text,
  opcionais jsonb not null default '[]'::jsonb,
  fotos jsonb not null default '[]'::jsonb,   -- urls públicas no storage
  is_consignado boolean not null default false,
  proprietario_id uuid references public.clientes(id) on delete set null,
  slug text unique
);
create index if not exists veiculos_status_idx on public.veiculos (status);
create index if not exists veiculos_destaque_idx on public.veiculos (destaque);

-- ---------- Vendas ----------
create table if not exists public.vendas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  veiculo_id uuid references public.veiculos(id) on delete set null,
  comprador_id uuid references public.clientes(id) on delete set null,
  valor numeric(12,2),
  forma_pagamento text,
  data_venda date default current_date,
  observacoes text
);

-- ---------- Consignações ----------
create table if not exists public.consignacoes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  veiculo_id uuid references public.veiculos(id) on delete set null,
  proprietario_id uuid references public.clientes(id) on delete set null,
  valor_desejado numeric(12,2),
  comissao_percent numeric(5,2),
  status text not null default 'ativa', -- ativa | vendida | encerrada
  observacoes text
);

-- ---------- Leads de consignação (formulário público) ----------
create table if not exists public.leads_consignacao (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text,
  telefone text,
  veiculo text,
  ano text,
  km text,
  valor text,
  observacoes text,
  status text not null default 'novo' -- novo | contatado | convertido | descartado
);

-- ---------- Documentos gerados (PDF + DOCX gravados) ----------
create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tipo text not null, -- procuracao | contrato | termo_consignacao | declaracao_residencia
  titulo text,
  cliente_id uuid references public.clientes(id) on delete set null,
  veiculo_id uuid references public.veiculos(id) on delete set null,
  venda_id uuid references public.vendas(id) on delete set null,
  pdf_path text,   -- caminho no bucket 'documentos'
  docx_path text,
  dados jsonb,     -- snapshot dos dados usados (para reimpressão fiel)
  criado_por uuid references auth.users(id) on delete set null
);
create index if not exists documentos_tipo_idx on public.documentos (tipo);
create index if not exists documentos_cliente_idx on public.documentos (cliente_id);

-- ---------- updated_at automático ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists clientes_touch on public.clientes;
create trigger clientes_touch before update on public.clientes
  for each row execute function public.touch_updated_at();
drop trigger if exists veiculos_touch on public.veiculos;
create trigger veiculos_touch before update on public.veiculos
  for each row execute function public.touch_updated_at();

-- ============================================================
-- RLS — internos (clientes/vendas/docs) só autenticado;
--       veiculos com leitura pública (pro site).
-- ============================================================
alter table public.profiles          enable row level security;
alter table public.clientes          enable row level security;
alter table public.veiculos          enable row level security;
alter table public.vendas            enable row level security;
alter table public.consignacoes      enable row level security;
alter table public.leads_consignacao enable row level security;
alter table public.documentos        enable row level security;

-- profiles: cada um vê/edita o seu; todos autenticados leem
create policy "profiles_select_auth" on public.profiles for select to authenticated using (true);
create policy "profiles_update_self" on public.profiles for update to authenticated using (auth.uid() = id);

-- autenticado tem acesso total às tabelas internas
do $$
declare t text;
begin
  foreach t in array array['clientes','vendas','consignacoes','documentos'] loop
    execute format('create policy "%1$s_all_auth" on public.%1$s for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- veiculos: leitura pública (site), escrita só autenticado
create policy "veiculos_public_read" on public.veiculos for select using (true);
create policy "veiculos_write_auth"  on public.veiculos for all to authenticated using (true) with check (true);

-- leads de consignação: qualquer um cria (form público), só autenticado lê/edita
create policy "leads_insert_anon" on public.leads_consignacao for insert with check (true);
create policy "leads_rw_auth"     on public.leads_consignacao for all to authenticated using (true) with check (true);

-- ============================================================
-- STORAGE — buckets
-- ============================================================
insert into storage.buckets (id, name, public) values ('veiculos','veiculos', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('documentos','documentos', false)
  on conflict (id) do nothing;

-- fotos de veículos: leitura pública, escrita autenticada
create policy "veiculos_storage_read" on storage.objects for select using (bucket_id = 'veiculos');
create policy "veiculos_storage_write" on storage.objects for all to authenticated
  using (bucket_id = 'veiculos') with check (bucket_id = 'veiculos');

-- documentos: só autenticado
create policy "documentos_storage_auth" on storage.objects for all to authenticated
  using (bucket_id = 'documentos') with check (bucket_id = 'documentos');
