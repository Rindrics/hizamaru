-- accounts
create table if not exists accounts (
  id text primary key,
  invite_token text not null unique,
  invite_token_expires_at timestamp with time zone not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- users
create table if not exists users (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists users_account_id_idx on users(account_id);
create unique index if not exists users_email_idx on users(email);

-- family_members
create table if not exists family_members (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  name text not null,
  birth_date date not null,
  relationship text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists family_members_account_id_idx on family_members(account_id);

-- life_plans
create table if not exists life_plans (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists life_plans_account_id_idx on life_plans(account_id);

-- life_events
create table if not exists life_events (
  id text primary key,
  life_plan_id text not null references life_plans(id) on delete cascade,
  event_type text not null,
  event_year integer not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  -- birth event
  family_member_id text references family_members(id) on delete set null,
  -- home purchase event
  home_price integer,
  down_payment integer,
  loan_years integer,
  loan_rate numeric,
  bonus_payment integer,
  -- education event
  school_type text,
  start_year integer,
  end_year integer,
  annual_admission_fee integer,
  -- tutoring event
  monthly_fee integer
);

create index if not exists life_events_life_plan_id_idx on life_events(life_plan_id);

-- tutoring_annual_expenses
create table if not exists tutoring_annual_expenses (
  id text primary key,
  life_event_id text not null references life_events(id) on delete cascade,
  name text not null,
  amount integer not null,
  frequency integer default 1,
  start_year integer not null,
  end_year integer,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists tutoring_annual_expenses_life_event_id_idx on tutoring_annual_expenses(life_event_id);

-- income
create table if not exists income (
  id text primary key,
  life_plan_id text not null references life_plans(id) on delete cascade,
  family_member_id text not null references family_members(id) on delete cascade,
  monthly_salary integer not null,
  bonus_amount integer not null,
  expected_raise_rate numeric not null,
  start_year integer not null,
  end_year integer,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists income_life_plan_id_idx on income(life_plan_id);
create index if not exists income_family_member_id_idx on income(family_member_id);

-- investments
create table if not exists investments (
  id text primary key,
  life_plan_id text not null references life_plans(id) on delete cascade,
  investment_type text not null,
  annual_contribution integer not null,
  annual_return_rate numeric not null,
  start_year integer not null,
  end_year integer,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists investments_life_plan_id_idx on investments(life_plan_id);

-- budget_categories
create table if not exists budget_categories (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists budget_categories_account_id_idx on budget_categories(account_id);

-- budgets
create table if not exists budgets (
  id text primary key,
  life_plan_id text not null references life_plans(id) on delete cascade,
  budget_category_id text not null references budget_categories(id) on delete cascade,
  amount integer not null,
  period text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists budgets_life_plan_id_idx on budgets(life_plan_id);
create index if not exists budgets_budget_category_id_idx on budgets(budget_category_id);

-- expenses
create table if not exists expenses (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  budget_category_id text not null references budget_categories(id) on delete cascade,
  amount integer not null,
  expense_date date not null,
  memo text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists expenses_account_id_idx on expenses(account_id);
create index if not exists expenses_budget_category_id_idx on expenses(budget_category_id);
create index if not exists expenses_expense_date_idx on expenses(expense_date);

-- Enable RLS
alter table accounts enable row level security;
alter table users enable row level security;
alter table family_members enable row level security;
alter table life_plans enable row level security;
alter table life_events enable row level security;
alter table tutoring_annual_expenses enable row level security;
alter table income enable row level security;
alter table investments enable row level security;
alter table budget_categories enable row level security;
alter table budgets enable row level security;
alter table expenses enable row level security;
