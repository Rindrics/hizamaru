'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { logger } from '@/lib/logger';

export async function login(formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const { error, data } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    logger.error('Login failed', {
      errorCode: error.status,
      errorMessage: error.message,
    });
    return { error: 'ログインに失敗しました' };
  }

  // Check if user record exists in public.users
  const { data: userRecord, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('id', data.user!.id.toString())
    .single();

  if (!userRecord) {
    // Create account for new user
    const accountId = crypto.randomUUID();
    const inviteToken = crypto.randomUUID();

    const { error: accountError } = await supabase.from('accounts').insert({
      id: accountId,
      invite_token: inviteToken,
      invite_token_expires_at: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });

    if (accountError) {
      logger.error('Failed to create account', {
        userId: data.user!.id,
        error: accountError.message,
      });
      return { error: 'アカウント初期化に失敗しました' };
    }

    // Create user record
    const { error: createUserError } = await supabase.from('users').insert({
      id: data.user!.id.toString(),
      account_id: accountId,
      email: data.user!.email,
    });

    if (createUserError) {
      logger.error('Failed to create user record', {
        userId: data.user!.id,
        accountId,
        error: createUserError.message,
      });
      return { error: 'ユーザー登録に失敗しました' };
    }
  }

  redirect('/');
}

export async function logout() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}
