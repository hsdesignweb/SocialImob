create or replace function public.activate_subscription(p_user_id uuid, p_plan_type text)
returns void as $$
begin
  update public.profiles
  set 
    is_paid = true,
    status = 'active',
    credits = case 
      when p_plan_type like 'basic%' then 
        case when status != 'active' then coalesce(credits, 0) + 500 else credits end
      when p_plan_type like 'pro%' then 10000
      when p_plan_type like 'premium%' then 50000
      else coalesce(credits, 0)
    end,
    subscription_date = now(),
    expires_at = case 
      when p_plan_type like '%yearly' then now() + interval '1 year'
      else now() + interval '1 month'
    end
  where id = p_user_id;
end;
$$ language plpgsql security definer;
