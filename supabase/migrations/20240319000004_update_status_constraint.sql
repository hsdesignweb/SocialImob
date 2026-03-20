-- Drop the existing check constraint on status
alter table public.profiles drop constraint if exists profiles_status_check;

-- Add the new check constraint with all supported statuses
alter table public.profiles add constraint profiles_status_check 
  check (status in ('active', 'suspended', 'pending_payment', 'expired', 'trial'));

-- Ensure hebert.ss@gmail.com is an admin
update public.profiles set is_admin = true where email = 'hebert.ss@gmail.com';
