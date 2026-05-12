-- Add color column to budget_categories
alter table budget_categories add column if not exists color text default '#808080';
