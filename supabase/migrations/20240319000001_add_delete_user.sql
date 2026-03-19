-- Create a function to delete a user from auth.users
create or replace function delete_user(user_id uuid)
returns void as $$
begin
  -- Check if the caller is an admin (e.g., hebert.ss@gmail.com)
  if (select email from auth.users where id = auth.uid()) = 'hebert.ss@gmail.com' then
    delete from auth.users where id = user_id;
  else
    raise exception 'Not authorized';
  end if;
end;
$$ language plpgsql security definer;
