-- Refactor income table to income_records + income_terms
-- income_records: 親エンティティ（雇用関係）
-- income_terms: 子エンティティ（期間ごとの給与情報）

CREATE TABLE income_records (
  id TEXT PRIMARY KEY,
  life_plan_id TEXT NOT NULL REFERENCES life_plans(id) ON DELETE CASCADE,
  family_member_id TEXT NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_income_records_life_plan_id ON income_records(life_plan_id);
CREATE INDEX idx_income_records_family_member_id ON income_records(family_member_id);

CREATE TABLE income_terms (
  id TEXT PRIMARY KEY,
  income_record_id TEXT NOT NULL REFERENCES income_records(id) ON DELETE CASCADE,
  monthly_salary INTEGER NOT NULL,
  bonus_months NUMERIC NOT NULL DEFAULT 0,
  bonus_payment_months TEXT NOT NULL DEFAULT '',
  expected_raise_rate NUMERIC NOT NULL,
  start_year INTEGER NOT NULL,
  end_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_income_terms_income_record_id ON income_terms(income_record_id);

-- Migrate existing income data
INSERT INTO income_records (id, life_plan_id, family_member_id)
SELECT id, life_plan_id, family_member_id FROM income;

INSERT INTO income_terms (id, income_record_id, monthly_salary, bonus_months, bonus_payment_months, expected_raise_rate, start_year, end_year)
SELECT id, id, monthly_salary, bonus_months, bonus_payment_months, expected_raise_rate, start_year, end_year FROM income;

-- Drop old table
DROP TABLE income;
