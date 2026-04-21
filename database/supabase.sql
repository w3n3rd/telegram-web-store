create table if not exists public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  customer jsonb not null,
  items jsonb not null,
  total integer not null,
  status text not null default 'new',
  payme_url text,
  paid_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.payme_transactions (
  id text primary key,
  payme_id text unique not null,
  order_id text not null references public.orders(id),
  amount integer not null,
  state integer not null,
  reason integer,
  create_time bigint not null,
  perform_time bigint,
  cancel_time bigint,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.payme_transactions enable row level security;

create index if not exists orders_status_idx on public.orders(status);
create index if not exists payme_transactions_order_id_idx on public.payme_transactions(order_id);
create index if not exists payme_transactions_payme_id_idx on public.payme_transactions(payme_id);
