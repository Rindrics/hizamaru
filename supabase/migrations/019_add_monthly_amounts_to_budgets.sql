-- Add monthly_amounts column to budgets table
-- This allows storing different amounts for each month (e.g., for seasonal variations)
alter table budgets add column monthly_amounts jsonb default null;

-- Column description:
-- monthly_amounts: JSON object with months as keys (1-12) and amounts as values
-- Example: {"1": 30000, "2": 32000, "3": 30000, ...}
-- If null, the 'amount' column is used for all months
