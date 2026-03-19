-- Create a table for public profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  is_admin boolean default false,
  credits integer default 0,
  is_paid boolean default false,
  subscription_date timestamp with time zone,
  status text check (status in ('active', 'suspended', 'pending_payment')) default 'pending_payment',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, credits, status, is_admin)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    0, -- Default 0 credits
    'pending_payment', -- Default status
    case when new.email = 'hebert.ss@gmail.com' then true else false end -- Auto-admin for specific email
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
