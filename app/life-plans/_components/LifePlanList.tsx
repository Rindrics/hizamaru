'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Copy, Edit2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ライフプラン } from '@/types';
import type { ProjectionYear } from '@/lib/projections/types';
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

interface LifePlanWithProjection {
  plan: ライフプラン;
  projections: ProjectionYear[];
}

interface Props {
  plansWithProjections: LifePlanWithProjection[];
}

export default function LifePlanList({
  plansWithProjections: initialPlansWithProjections,
}: Props) {
  const [displayPlans, setDisplayPlans] = useState<
    LifePlanWithProjection[] | null
  >(null);
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

  const plansToDisplay =
    displayPlans ||
    [...initialPlansWithProjections].sort(
      (a, b) => (b.plan.有効フラグ ? 1 : 0) - (a.plan.有効フラグ ? 1 : 0)
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
    const planData = plansToDisplay.find((p) => p.plan.ID === planId);
    if (planData) {
      setDeleteConfirm({
        id: planId,
        name: planData.plan.名前,
        type: 'delete',
      });
    }
  };

  const handleDuplicateConfirm = (planId: string) => {
    const planData = plansToDisplay.find((p) => p.plan.ID === planId);
    if (planData) {
      setDuplicateConfirm({ id: planId, name: planData.plan.名前 });
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
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${
              isLoading ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {plansToDisplay.map(({ plan, projections }) => (
              <div
                key={plan.ID}
                className={`rounded-lg border-2 p-4 transition-all duration-300 ${
                  highlightedPlanId === plan.ID
                    ? 'border-primary bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                } ${plan.有効フラグ ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              >
                {plan.有効フラグ && (
                  <div className="inline-block bg-primary text-primary-text text-xs font-semibold px-2 py-1 rounded mb-2">
                    メインプラン
                  </div>
                )}

                <h3
                  onClick={() => router.push(`/life-plans/${plan.ID}/edit`)}
                  className="text-lg font-semibold text-gray-900 mb-1 cursor-pointer hover:text-primary"
                >
                  {plan.名前}
                </h3>

                <p
                  onClick={() => router.push(`/life-plans/${plan.ID}/edit`)}
                  className="text-sm text-gray-600 mb-4 cursor-pointer hover:text-gray-900"
                >
                  {plan.説明 || '-'}
                </p>

                {projections.length > 0 && (
                  <div className="mb-4 -mx-4 px-4">
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={projections}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="year"
                          tick={{ fontSize: 12 }}
                          width={30}
                        />
                        <YAxis tick={{ fontSize: 12 }} width={60} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #ccc',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="totalAssets"
                          stroke="var(--color-primary)"
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => router.push(`/life-plans/${plan.ID}/edit`)}
                    className="text-primary hover:text-primary-hover inline-block p-1"
                    title="編集"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDuplicateConfirm(plan.ID)}
                    className="text-primary hover:text-primary-hover inline-block p-1"
                    title="複製"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteConfirm(plan.ID)}
                    className="inline-block hover:opacity-70 transition-opacity p-1"
                    title="削除"
                    style={{ color: '#F28379' }}
                  >
                    <Trash2 size={18} strokeWidth={2.5} />
                  </button>

                  {!plan.有効フラグ && (
                    <button
                      onClick={() => {
                        setDeleteConfirm({
                          id: plan.ID,
                          name: plan.名前,
                          type: 'setMain',
                        });
                      }}
                      className="ml-auto text-sm text-primary hover:text-primary-hover font-medium"
                    >
                      メインに設定
                    </button>
                  )}
                </div>
              </div>
            ))}
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
