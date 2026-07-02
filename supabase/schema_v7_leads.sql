-- ============================================================
-- v7 — Central de Leads (funil de atendimento) + Canais
-- ============================================================

-- Todo lead recebido de qualquer fonte (site, portais, e-mail, Facebook…)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  origem text not null default 'site',   -- site | whatsapp | socarrao | webmotors | olx | icarros | facebook | email | manual
  canal_detalhe text,                     -- nome livre do portal/campanha
  external_id text,                       -- id do lead no portal (idempotência)
  nome text,
  telefone text,
  email text,
  veiculo_id uuid references public.veiculos(id) on delete set null,
  veiculo_texto text,                     -- interesse em texto livre
  mensagem text,
  status text not null default 'novo',    -- novo | em_contato | visita | negociacao | ganho | perdido
  negociacao_id uuid references public.negociacoes(id) on delete set null,
  raw jsonb,
  unique (origem, external_id)
);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_created_idx on public.leads (created_at desc);

alter table public.leads enable row level security;
-- qualquer um cria (formulário público do site); só autenticado lê/edita
create policy "leads_insert_anon" on public.leads for insert with check (true);
create policy "leads_rw_auth" on public.leads for all to authenticated using (true) with check (true);

-- Registro dos canais de integração (onde o lojista cola a chave / vê status)
create table if not exists public.canais (
  key text primary key,             -- site | email | socarrao | webmotors | olx | icarros | facebook
  label text not null,
  tipo text not null,               -- site | email | api | webhook
  ativo boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  last_sync timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.canais enable row level security;
create policy "canais_rw_auth" on public.canais for all to authenticated using (true) with check (true);

insert into public.canais (key, label, tipo, ativo) values
  ('site',      'Site HL Motors',   'site',    true),
  ('email',     'Pesca-e-mail',     'email',   false),
  ('socarrao',  'SóCarrão',         'api',     false),
  ('webmotors', 'Webmotors',        'email',   false),
  ('olx',       'OLX / Zap',        'email',   false),
  ('icarros',   'iCarros',          'email',   false),
  ('facebook',  'Facebook Lead Ads','webhook', false)
on conflict (key) do nothing;
