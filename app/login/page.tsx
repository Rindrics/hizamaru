'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';

async function loginWithState(_: { error: string } | null, formData: FormData) {
  return login(formData);
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginWithState, null);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-8 text-black">ログイン情報を入力</h1>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-black">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-black">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'ログイン中...' : 'ログインする'}
          </button>
        </form>
      </div>
    </main>
  );
}
