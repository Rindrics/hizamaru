-- Remove demo_mode column from users table
ALTER TABLE public.users DROP COLUMN IF EXISTS demo_mode;

-- Drop all demo-account-specific RLS policies
DROP POLICY IF EXISTS "Allow reading demo account data" ON public.accounts;
DROP POLICY IF EXISTS "Allow reading demo users" ON public.users;
DROP POLICY IF EXISTS "Allow reading demo family members" ON public.family_members;
DROP POLICY IF EXISTS "Allow reading demo life plans" ON public.life_plans;
DROP POLICY IF EXISTS "Allow reading demo life events" ON public.life_events;
DROP POLICY IF EXISTS "Allow reading demo tutoring expenses" ON public.tutoring_annual_expenses;
DROP POLICY IF EXISTS "Allow reading demo investments" ON public.investments;
DROP POLICY IF EXISTS "Allow reading demo budget categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Allow reading demo budgets" ON public.budgets;
DROP POLICY IF EXISTS "Allow reading demo expenses" ON public.expenses;

-- Create allow-all SELECT policies for tables that need them (ownership enforced by application layer)
-- Note: family_members already has this policy from migration 005
DROP POLICY IF EXISTS "Allow reading accounts" ON public.accounts;
CREATE POLICY "Allow reading accounts" ON public.accounts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow reading users" ON public.users;
CREATE POLICY "Allow reading users" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow reading life plans" ON public.life_plans;
CREATE POLICY "Allow reading life plans" ON public.life_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow reading life events" ON public.life_events;
CREATE POLICY "Allow reading life events" ON public.life_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow reading tutoring expenses" ON public.tutoring_annual_expenses;
CREATE POLICY "Allow reading tutoring expenses" ON public.tutoring_annual_expenses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow reading investments" ON public.investments;
CREATE POLICY "Allow reading investments" ON public.investments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow reading budget categories" ON public.budget_categories;
CREATE POLICY "Allow reading budget categories" ON public.budget_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow reading budgets" ON public.budgets;
CREATE POLICY "Allow reading budgets" ON public.budgets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow reading expenses" ON public.expenses;
CREATE POLICY "Allow reading expenses" ON public.expenses FOR SELECT USING (true);
