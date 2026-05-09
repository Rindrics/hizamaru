-- Demo account and users
insert into accounts (id, invite_token, invite_token_expires_at) values
  ('demo-account', 'demo-token-123', now() + interval '30 days');

insert into users (id, account_id, email, display_name) values
  ('demo-user-1', 'demo-account', 'demo@example.com', 'デモユーザー');

-- Demo family members
insert into family_members (id, account_id, name, birth_date, relationship) values
  ('izanagi', 'demo-account', 'イザナギ', '1990-05-06', '夫'),
  ('izanami', 'demo-account', 'イザナミ', '1992-05-06', '妻'),
  ('amaterasu', 'demo-account', 'アマテラス', '2020-06-07', '長女');

-- Demo life plans
insert into life_plans (id, account_id, name, description, is_active) values
  ('plan-1', 'demo-account', '基本シナリオ', '標準的なライフプラン', true),
  ('plan-2', 'demo-account', 'シナリオ2', '比較対象のライフプラン', false);

-- Demo life events
insert into life_events (id, life_plan_id, event_type, event_year, family_member_id) values
  ('event-1', 'plan-1', '出産', 2020, 'amaterasu');

insert into life_events (id, life_plan_id, event_type, event_year, home_price, down_payment, loan_years, loan_rate) values
  ('event-2', 'plan-1', '住宅購入', 2026, 12300000, 1230000, 12, 0.123);
