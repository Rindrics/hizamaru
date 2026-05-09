-- Allow authenticated users to manage their life plans
-- Application layer enforces account ownership
create policy "Allow reading life plans" on life_plans
  for select using (true);

create policy "Allow inserting life plans" on life_plans
  for insert with check (true);

create policy "Allow updating life plans" on life_plans
  for update using (true) with check (true);

create policy "Allow deleting life plans" on life_plans
  for delete using (true);
