'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { updateUserDemoMode } from '@/app/actions/auth';
import { useTransition } from 'react';

export default function DemoToggle({ user }: { user: { id: string } | null }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isDemo = searchParams.get('demo') === '1';
  const [isPending, startTransition] = useTransition();

  const toggleDemo = () => {
    const newDemoMode = !isDemo;

    // Update URL immediately (optimistic update)
    const params = new URLSearchParams(searchParams);
    if (newDemoMode) {
      params.set('demo', '1');
    } else {
      params.delete('demo');
    }
    router.push(`?${params.toString()}`);

    // Update server state in background
    if (user) {
      startTransition(async () => {
        await updateUserDemoMode(newDemoMode);
      });
    }
  };

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
