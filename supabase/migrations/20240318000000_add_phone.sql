-- Add phone column to profiles table
alter table public.profiles add column if not exists phone text;

-- Update handle_new_user function to include phone
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, phone, credits, status, is_admin)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'phone',
    0, -- Default 0 credits
    'pending_payment', -- Default status
    case when new.email = 'hebert.ss@gmail.com' then true else false end -- Auto-admin for specific email
  );
  return new;
end;
$$ language plpgsql security definer;
