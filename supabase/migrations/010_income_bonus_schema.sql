-- Replace bonus_amount with bonus_months and bonus_payment_months
-- bonus_months: represents how many months of salary (e.g., 2.5)
-- bonus_payment_months: comma-separated month numbers when bonus is paid (e.g., "6,12")

-- Add new columns if they don't exist
ALTER TABLE public.income ADD COLUMN IF NOT EXISTS bonus_months NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.income ADD COLUMN IF NOT EXISTS bonus_payment_months TEXT NOT NULL DEFAULT '';

-- Drop bonus_amount column if it exists
ALTER TABLE public.income DROP COLUMN IF EXISTS bonus_amount;

-- Update SELECT policy to allow all users to read income
-- (application layer enforces account ownership)
DROP POLICY IF EXISTS "Allow reading demo income" ON public.income;
CREATE POLICY "Allow reading income" ON public.income FOR SELECT USING (true);
