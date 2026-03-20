-- Allow admins to update any profile
create policy "Admins can update any profile" on public.profiles
  for update using (
    (select is_admin from public.profiles where id = auth.uid()) = true
  );
