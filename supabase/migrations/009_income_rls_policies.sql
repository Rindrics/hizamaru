-- Add RLS policies for income table INSERT/UPDATE/DELETE
-- The initial SELECT policy is already defined in migration 001

CREATE POLICY "Allow inserting income" ON public.income
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow updating income" ON public.income
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow deleting income" ON public.income
  FOR DELETE USING (true);
