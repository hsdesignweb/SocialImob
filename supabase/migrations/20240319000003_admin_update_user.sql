-- Create RPC function to allow admins to update users
create or replace function public.admin_update_user(
  p_user_id uuid,
  p_name text,
  p_credits integer,
  p_status text,
  p_is_paid boolean
)
returns void as $$
declare
  v_is_admin boolean;
begin
  -- Check if the caller is an admin
  select is_admin into v_is_admin from public.profiles where id = auth.uid();
  
  if not v_is_admin then
    raise exception 'Unauthorized: Only admins can update users.';
  end if;

  -- Update the user
  update public.profiles
  set 
    name = p_name,
    credits = p_credits,
    status = p_status,
    is_paid = p_is_paid
  where id = p_user_id;
end;
$$ language plpgsql security definer;
