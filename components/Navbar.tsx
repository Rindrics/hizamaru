import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { logout } from '@/app/actions/auth';
import DemoToggle from './DemoToggle';

export default async function Navbar() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-black">
            hizamaru
          </Link>

          <div className="flex items-center gap-4">
            {user && (
              <Link
                href="/family"
                className="text-sm text-gray-700 hover:text-primary"
              >
                家族
              </Link>
            )}
            <DemoToggle user={user} />
            {user && (
              <>
                <span className="text-sm text-gray-700">{user.email}</span>
                <form action={logout}>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-primary-text bg-primary rounded-lg hover:bg-primary-hover"
                  >
                    ログアウト
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
