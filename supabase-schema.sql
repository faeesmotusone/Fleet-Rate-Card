-- ============================================================
-- Fleet Rate Card – Supabase Schema
-- Run this in your Supabase SQL Editor (supabase.com > project > SQL Editor)
-- ============================================================

-- 1. Table for manually added rates
create table if not exists manual_rates (
  id uuid default gen_random_uuid() primary key,
  country text not null check (country in ('KSA', 'UAE', 'International')),
  city text not null,
  type text not null check (type in ('Daily', 'Transfer')),
  detail text not null,
  vehicle text not null,
  rate numeric(12,2) not null check (rate > 0),
  currency text not null default 'SAR',
  month text not null,  -- YYYY-MM format
  po text,              -- optional PO number
  note text,            -- optional note, max 200 chars
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Index for fast lookups
create index idx_manual_rates_country_type on manual_rates(country, type);
create index idx_manual_rates_vehicle on manual_rates(vehicle);

-- 3. Enable Row Level Security
alter table manual_rates enable row level security;

-- 4. Policies
-- Anyone authenticated can read all rates
create policy "Anyone can read rates"
  on manual_rates for select
  to authenticated
  using (true);

-- Authenticated users can insert their own rates
create policy "Users can add rates"
  on manual_rates for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Users can delete only their own rates
create policy "Users can delete own rates"
  on manual_rates for delete
  to authenticated
  using (auth.uid() = created_by);

-- 5. Auto-update timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger manual_rates_updated_at
  before update on manual_rates
  for each row execute function update_updated_at();

-- 6. Optional: enable realtime so the rate card updates live
alter publication supabase_realtime add table manual_rates;
