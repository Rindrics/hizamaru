-- Allow authenticated users to read and manage their own user record
create policy "Allow users to read their own record" on public.users
  for select using (id = auth.uid()::text);

create policy "Allow users to update their own record" on public.users
  for update using (id = auth.uid()::text);
