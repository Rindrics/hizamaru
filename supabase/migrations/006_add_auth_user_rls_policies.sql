-- Allow authenticated users to create accounts
create policy "Allow authenticated users to create accounts" on accounts
  for insert with check (true);

-- Allow users to read their own account
create policy "Allow users to read their own account" on accounts
  for select using (
    id in (
      select account_id from users where id = auth.uid()::text
    )
  );

-- Allow authenticated users to create their own user record
create policy "Allow users to insert their own user record" on users
  for insert with check (id = auth.uid()::text);

-- Allow users to read their own user record
create policy "Allow users to read their own user record" on users
  for select using (id = auth.uid()::text);

-- Allow users to update their own user record
create policy "Allow users to update their own user record" on users
  for update using (id = auth.uid()::text);
