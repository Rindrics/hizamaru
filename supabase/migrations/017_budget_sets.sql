-- Create budget_sets table
create table if not exists budget_sets (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists budget_sets_account_id_idx on budget_sets(account_id);

-- Add budget_set_id to life_plans
alter table life_plans add column if not exists budget_set_id text references budget_sets(id) on delete set null;

-- Recreate budgets table without life_plan_id and period
drop table if exists budgets cascade;

create table budgets (
  id text primary key,
  budget_set_id text not null references budget_sets(id) on delete cascade,
  budget_category_id text not null references budget_categories(id) on delete cascade,
  amount integer not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists budgets_budget_set_id_idx on budgets(budget_set_id);
create index if not exists budgets_budget_category_id_idx on budgets(budget_category_id);

-- Enable RLS
alter table budget_sets enable row level security;

-- RLS policies for budget_sets
create policy "budget_sets_select" on budget_sets for select using (true);
create policy "budget_sets_insert" on budget_sets for insert with check (true);
create policy "budget_sets_update" on budget_sets for update using (true);
create policy "budget_sets_delete" on budget_sets for delete using (true);

-- RLS policies for budgets (new)
create policy "budgets_select" on budgets for select using (true);
create policy "budgets_insert" on budgets for insert with check (true);
create policy "budgets_update" on budgets for update using (true);
create policy "budgets_delete" on budgets for delete using (true);

-- Drop old demo-only RLS policies on budget_categories
drop policy if exists "Allow reading demo budget categories" on budget_categories;

-- Add permissive RLS policies for budget_categories
create policy "budget_categories_select" on budget_categories for select using (true);
create policy "budget_categories_insert" on budget_categories for insert with check (true);
create policy "budget_categories_update" on budget_categories for update using (true);
create policy "budget_categories_delete" on budget_categories for delete using (true);
