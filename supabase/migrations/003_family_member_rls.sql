-- Allow authenticated users to read their own family members
create policy "Allow reading own family members" on family_members
  for select using (
    account_id = (select account_id from public.users where id = auth.uid()::text)
  );

-- Allow authenticated users to insert their own family members
create policy "Allow inserting own family members" on family_members
  for insert with check (
    account_id = (select account_id from public.users where id = auth.uid()::text)
  );

-- Allow authenticated users to update their own family members
create policy "Allow updating own family members" on family_members
  for update using (
    account_id = (select account_id from public.users where id = auth.uid()::text)
  ) with check (
    account_id = (select account_id from public.users where id = auth.uid()::text)
  );

-- Allow authenticated users to delete their own family members
create policy "Allow deleting own family members" on family_members
  for delete using (
    account_id = (select account_id from public.users where id = auth.uid()::text)
  );
