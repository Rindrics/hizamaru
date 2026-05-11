-- Local development only: Test account and auth user
insert into accounts (id, invite_token, invite_token_expires_at) values
  ('test-account', 'test-token-123', now() + interval '30 days');

-- Auth users (test user)
-- Password: admin123
with credentials(id, email, password) as (
  select * from (values
    ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'admin@example.com', 'admin123')
  ) as users(id, email, password)
),
create_user as (
  insert into auth.users (id, instance_id, role, aud, email, raw_app_meta_data, raw_user_meta_data, is_super_admin, encrypted_password, created_at, updated_at, last_sign_in_at, email_confirmed_at, confirmation_sent_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    select id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', email, '{"provider":"email","providers":["email"]}', '{}', false, crypt(password, gen_salt('bf')), now(), now(), now(), now(), now(), '', '', '', '' from credentials
  returning id
)
insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  select gen_random_uuid(), id::text, id, json_build_object('sub', id::text), 'email', now(), now(), now() from create_user;

-- Test user record
insert into users (id, account_id, email, display_name) values
  ('550e8400-e29b-41d4-a716-446655440000', 'test-account', 'admin@example.com', 'テストユーザー');

-- Family members
insert into family_members (id, account_id, name, birth_date, relationship) values
  ('izanagi', 'test-account', 'イザナギ', '1990-05-06', '夫'),
  ('izanami', 'test-account', 'イザナミ', '1992-05-06', '妻'),
  ('amaterasu', 'test-account', 'アマテラス', '2020-06-07', '長女');

-- Life plans
insert into life_plans (id, account_id, name, description, is_active) values
  ('plan-1', 'test-account', '基本シナリオ', '標準的なライフプラン', true),
  ('plan-2', 'test-account', 'シナリオ2', '比較対象のライフプラン', false);

-- Life plan family members
insert into life_plan_family_members (id, life_plan_id, family_member_id, name, relationship, income) values
  ('lp_fm_plan1_izanagi', 'plan-1', 'izanagi', 'イザナギ', '夫', 5000000),
  ('lp_fm_plan1_izanami', 'plan-1', 'izanami', 'イザナミ', '妻', 3500000),
  ('lp_fm_plan1_amaterasu', 'plan-1', 'amaterasu', 'アマテラス', '長女', 0),
  ('lp_fm_plan2_izanagi', 'plan-2', 'izanagi', 'イザナギ', '夫', 5500000),
  ('lp_fm_plan2_izanami', 'plan-2', 'izanami', 'イザナミ', '妻', 3500000),
  ('lp_fm_plan2_amaterasu', 'plan-2', 'amaterasu', 'アマテラス', '長女', 0);

-- Income records for plan-1
insert into income_records (id, life_plan_id, family_member_id, name) values
  ('income-1', 'plan-1', 'izanagi', '本業'),
  ('income-2', 'plan-1', 'izanami', '本業');

-- Income terms for plan-1
insert into income_terms (id, income_record_id, monthly_salary, bonus_months, bonus_payment_months, expected_raise_rate, start_year) values
  ('income-term-1', 'income-1', 600000, 2.5, '6,12', 0.02, 2024),
  ('income-term-2', 'income-2', 400000, 2.0, '6,12', 0.015, 2024);

-- Income records for plan-2
insert into income_records (id, life_plan_id, family_member_id, name) values
  ('income-3', 'plan-2', 'izanagi', '本業'),
  ('income-4', 'plan-2', 'izanami', '本業');

-- Income terms for plan-2
insert into income_terms (id, income_record_id, monthly_salary, bonus_months, bonus_payment_months, expected_raise_rate, start_year) values
  ('income-term-3', 'income-3', 620000, 2.5, '6,12', 0.02, 2024),
  ('income-term-4', 'income-4', 400000, 2.0, '6,12', 0.015, 2024);

-- Life events
insert into life_events (id, life_plan_id, event_type, event_year, family_member_id) values
  ('event-1', 'plan-1', '出産', 2020, 'amaterasu');

insert into life_events (id, life_plan_id, event_type, event_year, home_price, down_payment, loan_years, loan_rate) values
  ('event-2', 'plan-1', '住宅購入', 2026, 12300000, 1230000, 12, 0.123);
