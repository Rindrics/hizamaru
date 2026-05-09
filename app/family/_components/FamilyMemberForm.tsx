'use client';

import { useActionState, useState } from 'react';
import type { 家族メンバー, 家族メンバー続柄 } from '@/types';

const 続柄オプション: 家族メンバー続柄[] = [
  '夫',
  '妻',
  '長女',
  '長男',
  '次女',
  '次男',
  '三女',
  '三男',
];

interface Props {
  action: (
    prevState: unknown,
    formData: FormData
  ) => Promise<{ 成功?: boolean; エラー?: string }>;
  defaultValues?: 家族メンバー;
}

export default function FamilyMemberForm({ action, defaultValues }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(
    defaultValues?.生年月日.getFullYear().toString() || ''
  );
  const [month, setMonth] = useState(
    String(defaultValues?.生年月日.getMonth() + 1 || '').padStart(2, '0')
  );
  const [day, setDay] = useState(
    String(defaultValues?.生年月日.getDate() || '').padStart(2, '0')
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!year || !month || !day) {
      e.preventDefault();
      return;
    }
    // Combine date and pass as hidden input
    const dateStr = `${year}-${month}-${day}`;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = '生年月日';
    input.value = dateStr;
    e.currentTarget.appendChild(input);
  };

  return (
    <form action={formAction} className="space-y-6" onSubmit={handleSubmit}>
      {state?.エラー && (
        <div
          className="p-4 rounded-md"
          style={{
            backgroundColor: 'rgba(242, 131, 121, 0.1)',
            borderColor: 'var(--error)',
            borderWidth: '1px',
          }}
        >
          <p className="text-sm text-error">{state.エラー}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="名前"
          className="block text-sm font-medium text-gray-900"
        >
          名前
        </label>
        <input
          type="text"
          name="名前"
          id="名前"
          defaultValue={defaultValues?.名前 || ''}
          required
          disabled={isPending}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          生年月日
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="year" className="block text-xs text-gray-600 mb-1">
              年
            </label>
            <select
              name="year"
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
              disabled={isPending}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="">年</option>
              {Array.from({ length: currentYear - 1900 + 10 }, (_, i) => {
                const y = currentYear - i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="month" className="block text-xs text-gray-600 mb-1">
              月
            </label>
            <select
              name="month"
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
              disabled={isPending}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="">月</option>
              {Array.from({ length: 12 }, (_, i) => {
                const m = String(i + 1).padStart(2, '0');
                return (
                  <option key={m} value={m}>
                    {m}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="day" className="block text-xs text-gray-600 mb-1">
              日
            </label>
            <select
              name="day"
              id="day"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              required
              disabled={isPending}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="">日</option>
              {Array.from({ length: 31 }, (_, i) => {
                const d = String(i + 1).padStart(2, '0');
                return (
                  <option key={d} value={d}>
                    {d}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="続柄"
          className="block text-sm font-medium text-gray-900"
        >
          続柄
        </label>
        <select
          name="続柄"
          id="続柄"
          defaultValue={defaultValues?.続柄 || ''}
          required
          disabled={isPending}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
        >
          <option value="">選択してください</option>
          {続柄オプション.map((rel) => (
            <option key={rel} value={rel}>
              {rel}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-primary-text py-2 px-4 rounded-md hover:bg-primary-hover disabled:opacity-50 font-medium"
      >
        {isPending ? '処理中...' : '保存'}
      </button>
    </form>
  );
}
