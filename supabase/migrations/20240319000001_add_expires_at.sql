-- Add expires_at column
alter table public.profiles add column if not exists expires_at timestamp with time zone;

-- Create RPC function to activate subscription with exact calendar intervals
create or replace function public.activate_subscription(p_user_id uuid, p_plan_type text)
returns void as $$
begin
  update public.profiles
  set 
    is_paid = true,
    status = 'active',
    credits = case when p_plan_type = 'yearly' then 1200 else 100 end,
    subscription_date = now(),
    expires_at = case 
      when p_plan_type = 'yearly' then now() + interval '1 year'
      else now() + interval '1 month'
    end
  where id = p_user_id;
end;
$$ language plpgsql security definer;
