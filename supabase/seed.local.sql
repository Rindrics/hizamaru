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
insert into users (id, account_id, email, display_name, demo_mode) values
  ('550e8400-e29b-41d4-a716-446655440000', 'test-account', 'admin@example.com', 'テストユーザー', false);
