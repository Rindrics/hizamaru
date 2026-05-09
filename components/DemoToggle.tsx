'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export default function DemoToggle() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isDemo = searchParams.get('demo') === '1';

  const toggleDemo = () => {
    const params = new URLSearchParams(searchParams);
    if (isDemo) {
      params.delete('demo');
    } else {
      params.set('demo', '1');
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <button
      onClick={toggleDemo}
      className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
    >
      {isDemo ? 'デモ: ON' : 'デモ: OFF'}
    </button>
  );
}
