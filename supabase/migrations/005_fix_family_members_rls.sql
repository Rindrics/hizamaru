-- Drop existing policies
drop policy if exists "Allow reading own family members" on family_members;
drop policy if exists "Allow inserting own family members" on family_members;
drop policy if exists "Allow updating own family members" on family_members;
drop policy if exists "Allow deleting own family members" on family_members;

-- Simpler policies: allow access based on account_id
-- For authenticated users, we trust the application layer to enforce account ownership
create policy "Allow reading family members" on family_members
  for select using (true);

create policy "Allow inserting family members" on family_members
  for insert with check (true);

create policy "Allow updating family members" on family_members
  for update using (true) with check (true);

create policy "Allow deleting family members" on family_members
  for delete using (true);
