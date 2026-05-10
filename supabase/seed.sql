-- Demo account and users
insert into accounts (id, invite_token, invite_token_expires_at) values
  ('demo-account', 'demo-token-123', now() + interval '30 days');

insert into users (id, account_id, email, display_name, demo_mode) values
  ('demo-user-1', 'demo-account', 'demo@example.com', 'デモユーザー', false);

-- Demo family members
insert into family_members (id, account_id, name, birth_date, relationship) values
  ('izanagi', 'demo-account', 'イザナギ', '1990-05-06', '夫'),
  ('izanami', 'demo-account', 'イザナミ', '1992-05-06', '妻'),
  ('amaterasu', 'demo-account', 'アマテラス', '2020-06-07', '長女');

-- Demo life plans
insert into life_plans (id, account_id, name, description, is_active) values
  ('plan-1', 'demo-account', '基本シナリオ', '標準的なライフプラン', true),
  ('plan-2', 'demo-account', 'シナリオ2', '比較対象のライフプラン', false);

-- Demo life plan family members
insert into life_plan_family_members (id, life_plan_id, family_member_id, name, relationship, income) values
  ('lp_fm_plan1_izanagi', 'plan-1', 'izanagi', 'イザナギ', '夫', 5000000),
  ('lp_fm_plan1_izanami', 'plan-1', 'izanami', 'イザナミ', '妻', 3500000),
  ('lp_fm_plan1_amaterasu', 'plan-1', 'amaterasu', 'アマテラス', '長女', 0),
  ('lp_fm_plan2_izanagi', 'plan-2', 'izanagi', 'イザナギ', '夫', 5500000),
  ('lp_fm_plan2_izanami', 'plan-2', 'izanami', 'イザナミ', '妻', 3500000),
  ('lp_fm_plan2_amaterasu', 'plan-2', 'amaterasu', 'アマテラス', '長女', 0);

-- Demo life events
insert into life_events (id, life_plan_id, event_type, event_year, family_member_id) values
  ('event-1', 'plan-1', '出産', 2020, 'amaterasu');

insert into life_events (id, life_plan_id, event_type, event_year, home_price, down_payment, loan_years, loan_rate) values
  ('event-2', 'plan-1', '住宅購入', 2026, 12300000, 1230000, 12, 0.123);
