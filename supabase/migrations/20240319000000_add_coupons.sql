create table public.coupons (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  discount_percent integer not null check (discount_percent > 0 and discount_percent <= 100),
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.coupons enable row level security;

-- Allow public read access to active coupons
create policy "Allow public read access to active coupons"
  on public.coupons for select
  using (active = true);
