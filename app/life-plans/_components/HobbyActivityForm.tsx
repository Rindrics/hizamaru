'use client';

import { useActionState } from 'react';

interface HobbyActivity {
  id: string;
  life_plan_id: string;
  family_member_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  action: (
    prevState: unknown,
    formData: FormData
  ) => Promise<{ 成功?: boolean; エラー?: string } | null | undefined>;
  defaultValues?: HobbyActivity;
}

export default function HobbyActivityForm({ action, defaultValues }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.エラー && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {state.エラー}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          習い事名
        </label>
        <input
          type="text"
          name="name"
          required
          defaultValue={defaultValues?.name ?? ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black"
          placeholder="ピアノ、水泳など"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover disabled:opacity-50"
        >
          {isPending ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
}
