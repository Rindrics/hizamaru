'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function login(formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    return { error: error.message };
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
