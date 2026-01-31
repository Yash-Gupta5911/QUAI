-- Copy and Run this in your Supabase SQL Editor to create the necessary tables

-- 1. Create Blocks Table
create table public.blocks (
  number bigint primary key,
  hash text unique,
  miner text,
  timestamp bigint, -- Stored as raw timestamp or epoch
  tx_count int,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Transactions Table
create table public.transactions (
  hash text primary key,
  block_number bigint references public.blocks(number),
  method text default 'Transfer',
  value text, -- Stored as string to verify precision or "1.2 QUAI"
  status text default 'Success',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.blocks enable row level security;
alter table public.transactions enable row level security;

-- 4. Create Policies (Allow Public Read/Write for Hackathon purposes)
-- NOTE: In production, Write should only be allowed by Service Role!
create policy "Allow Public Read Blocks" on public.blocks for select using (true);
create policy "Allow Public Insert Blocks" on public.blocks for insert with check (true);
create policy "Allow Public Update Blocks" on public.blocks for update using (true);

create policy "Allow Public Read Txs" on public.transactions for select using (true);
create policy "Allow Public Insert Txs" on public.transactions for insert with check (true);
create policy "Allow Public Update Txs" on public.transactions for update using (true);
