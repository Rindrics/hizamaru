'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Copy, Edit2 } from 'lucide-react';
import type { ライフプラン } from '@/types';
import {
  ライフプラン削除,
  ライフプランをメインにする,
  ライフプラン複製,
  ライフプラン一覧取得,
} from '@/app/actions/lifePlans';
import FamilyMemberModal from '@/app/family/_components/FamilyMemberModal';
import LifePlanForm from './LifePlanForm';
import ConfirmDialog from '@/app/family/_components/ConfirmDialog';
import { ライフプラン追加 } from '@/app/actions/lifePlans';
import Toast from '@/app/_components/Toast';
import { useToast } from '@/lib/hooks/useToast';

interface Props {
  plans: ライフプラン[];
}

export default function LifePlanList({ plans: initialPlans }: Props) {
  const [displayPlans, setDisplayPlans] = useState<ライフプラン[] | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
    type?: 'delete' | 'setMain';
  } | null>(null);
  const [duplicateConfirm, setDuplicateConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [highlightedPlanId, setHighlightedPlanId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();
  const { toasts, remove, info, success } = useToast();
  const router = useRouter();

  // リロード直後はソート済みを使い、操作後はソート前の順序を保つ
  const plansToDisplay =
    displayPlans ||
    [...initialPlans].sort(
      (a, b) => (b.有効フラグ ? 1 : 0) - (a.有効フラグ ? 1 : 0)
    );

  const handleAddClose = () => {
    setIsAddOpen(false);
  };

  const addActionWithState = async (prevState: unknown, formData: FormData) => {
    const result = await ライフプラン追加(prevState, formData);
    if (result?.成功 === false) {
      return result;
    }
    return null;
  };

  const handleDeleteConfirm = (planId: string) => {
    const plan = plansToDisplay.find((p) => p.ID === planId);
    if (plan) {
      setDeleteConfirm({ id: planId, name: plan.名前, type: 'delete' });
    }
  };

  const handleDuplicateConfirm = (planId: string) => {
    const plan = plansToDisplay.find((p) => p.ID === planId);
    if (plan) {
      setDuplicateConfirm({ id: planId, name: plan.名前 });
    }
  };

  const handleDuplicateExecute = () => {
    if (!duplicateConfirm) return;
    info('複製中...', 1.0, 'processing');
    startTransition(async () => {
      const result = await ライフプラン複製(duplicateConfirm.id);

      if (result?.成功) {
        success('複製完了', 1.0, 'completed');
        setTimeout(() => router.refresh(), 2500);
      }
    });
  };

  const handleConfirmExecute = async () => {
    if (!deleteConfirm) return;

    setIsLoading(true);
    try {
      if (deleteConfirm.type === 'setMain') {
        setHighlightedPlanId(deleteConfirm.id);
        await ライフプランをメインにする(deleteConfirm.id);
      } else {
        info('削除中...', 1.0, 'processing');
        await ライフプラン削除(deleteConfirm.id);
        success('削除完了', 1.0, 'completed');
      }
      // Fetch fresh data after the DB update.
      const updatedPlans = await ライフプラン一覧取得();
      setDisplayPlans(updatedPlans);
      setHighlightedPlanId(null);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      <Toast toasts={toasts} onRemove={remove} />
      <div className="p-6 flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          ライフプラン一覧
        </h3>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-primary text-primary-text px-4 py-2 rounded-md hover:bg-primary-hover"
        >
          + 追加
        </button>
      </div>
      <div className="px-6 pb-6">
        {plansToDisplay.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            ライフプランが作成されていません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    プラン名
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    説明
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    メインプラン
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y divide-gray-200 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {plansToDisplay.map((plan) => (
                  <tr
                    key={plan.ID}
                    className={`transition-all duration-500 ${
                      highlightedPlanId === plan.ID
                        ? 'bg-blue-50 drop-shadow-md'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td
                      onClick={() => router.push(`/life-plans/${plan.ID}/edit`)}
                      className="px-6 py-4 text-sm font-medium text-gray-900 cursor-pointer"
                    >
                      {plan.名前}
                    </td>
                    <td
                      onClick={() => router.push(`/life-plans/${plan.ID}/edit`)}
                      className="px-6 py-4 text-sm text-gray-600 cursor-pointer"
                    >
                      {plan.説明 || '-'}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="radio"
                        name="main-plan"
                        value={plan.ID}
                        checked={plan.有効フラグ}
                        autoComplete="off"
                        onChange={() => {
                          if (plan.有効フラグ) return;
                          setDeleteConfirm({
                            id: plan.ID,
                            name: plan.名前,
                            type: 'setMain',
                          });
                        }}
                        className="w-4 h-4"
                      />
                    </td>
                    <td
                      className="px-6 py-4 text-sm space-x-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => router.push(`/life-plans/${plan.ID}/edit`)}
                        className="text-primary hover:text-primary-hover inline-block"
                        title="編集"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDuplicateConfirm(plan.ID)}
                        className="text-primary hover:text-primary-hover inline-block"
                        title="複製"
                      >
                        <Copy size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(plan.ID)}
                        className="inline-block hover:opacity-70 transition-opacity"
                        title="削除"
                        style={{ color: '#F28379' }}
                      >
                        <Trash2 size={20} strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FamilyMemberModal
        isOpen={isAddOpen}
        onClose={handleAddClose}
        title="ライフプランを追加"
      >
        <LifePlanForm action={addActionWithState} />
      </FamilyMemberModal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title={
          deleteConfirm?.type === 'setMain'
            ? 'メインプランに設定しますか？'
            : '削除してよろしいですか？'
        }
        message={
          deleteConfirm?.type === 'setMain'
            ? `「${deleteConfirm?.name}」をメインプランに設定します。`
            : `「${deleteConfirm?.name}」を削除します。この操作は取り消せません。`
        }
        confirmText={
          deleteConfirm?.type === 'setMain' ? 'メインプランに設定' : '削除'
        }
        cancelText="キャンセル"
        isDangerous={deleteConfirm?.type === 'delete'}
        onConfirm={() => {
          handleConfirmExecute();
        }}
        onCancel={() => setDeleteConfirm(null)}
      />

      <ConfirmDialog
        isOpen={!!duplicateConfirm}
        title="ライフプランを複製しますか？"
        message={`「${duplicateConfirm?.name}」を複製します。複製には少し時間がかかります。`}
        confirmText="複製"
        cancelText="キャンセル"
        onConfirm={() => {
          handleDuplicateExecute();
          setDuplicateConfirm(null);
        }}
        onCancel={() => setDuplicateConfirm(null)}
      />
    </>
  );
}
