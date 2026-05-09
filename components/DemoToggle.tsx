'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { updateUserDemoMode } from '@/app/actions/auth';
import { useCallback, useState } from 'react';

export default function DemoToggle({ user }: { user: { id: string } | null }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isDemo = searchParams.get('demo') === '1';
  const [isPending, setIsPending] = useState(false);

  const toggleDemo = useCallback(async () => {
    setIsPending(true);
    const newDemoMode = !isDemo;

    // Update server state if user is logged in
    if (user) {
      await updateUserDemoMode(newDemoMode);
    }

    // Update URL
    const params = new URLSearchParams(searchParams);
    if (newDemoMode) {
      params.set('demo', '1');
    } else {
      params.delete('demo');
    }
    router.push(`?${params.toString()}`);
    setIsPending(false);
  }, [isDemo, searchParams, router, user]);

  return (
    <button
      onClick={toggleDemo}
      disabled={isPending}
      className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 disabled:opacity-50"
    >
      {isDemo ? 'デモ: ON' : 'デモ: OFF'}
    </button>
  );
}
