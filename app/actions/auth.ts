'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function login(formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const { error, data } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    return { error: error.message };
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

    const { error: accountError } = await supabase
      .from('accounts')
      .insert({
        id: accountId,
        invite_token: '',
        invite_token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (accountError) {
      return { error: 'Failed to initialize user account' };
    }

    // Create user record
    const { error: createUserError } = await supabase
      .from('users')
      .insert({
        id: data.user!.id.toString(),
        account_id: accountId,
        email: data.user!.email,
      });

    if (createUserError) {
      return { error: 'Failed to create user record' };
    }
  }

  redirect('/');
}

export async function logout() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function updateUserDemoMode(demoMode: boolean) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'User not authenticated' };
  }

  const { error } = await supabase
    .from('users')
    .update({ demo_mode: demoMode })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
