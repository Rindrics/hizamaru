'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit2, Trash2 } from 'lucide-react';
import type { ライフプラン } from '@/types';
import {
  ライフプラン削除,
  ライフプランをメインにする,
} from '@/app/actions/lifePlans';
import FamilyMemberModal from '@/app/family/_components/FamilyMemberModal';
import LifePlanForm from './LifePlanForm';
import ConfirmDialog from '@/app/family/_components/ConfirmDialog';
import { ライフプラン追加 } from '@/app/actions/lifePlans';

interface Props {
  plans: ライフプラン[];
}

export default function LifePlanList({ plans }: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
    type?: 'delete' | 'setMain';
  } | null>(null);

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
    const plan = plans.find((p) => p.ID === planId);
    if (plan) {
      setDeleteConfirm({ id: planId, name: plan.名前, type: 'delete' });
    }
  };

  const handleConfirmExecute = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'setMain') {
      await ライフプランをメインにする(deleteConfirm.id);
    } else {
      await ライフプラン削除(deleteConfirm.id);
    }
  };

  return (
    <>
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
        {plans.length === 0 ? (
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
              <tbody className="divide-y divide-gray-200">
                {plans.map((plan) => (
                  <tr key={plan.ID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {plan.名前}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {plan.説明 || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <input
                        type="radio"
                        name="main-plan"
                        value={plan.ID}
                        checked={plan.有効フラグ}
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
                    <td className="px-6 py-4 text-sm space-x-3">
                      <Link
                        href={`/life-plans/${plan.ID}/edit`}
                        className="text-primary hover:text-primary-hover inline-block"
                        title="編集"
                      >
                        <Edit2 size={18} />
                      </Link>
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
          setDeleteConfirm(null);
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}
