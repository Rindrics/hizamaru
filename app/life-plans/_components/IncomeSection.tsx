'use client';

import { useState } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import FamilyMemberModal from '@/app/family/_components/FamilyMemberModal';
import ConfirmDialog from '@/app/family/_components/ConfirmDialog';
import IncomeForm from './IncomeForm';
import { 収入追加, 収入更新, 収入削除 } from '@/app/actions/income';

interface FamilyMemberRow {
  id: string;
  life_plan_id: string;
  family_member_id: string;
  name: string;
  relationship: string;
  income: number;
}

interface IncomeRow {
  id: string;
  life_plan_id: string;
  family_member_id: string;
  monthly_salary: number;
  bonus_months: number;
  bonus_payment_months: string;
  expected_raise_rate: number;
  start_year: number;
  end_year: number | null;
}

interface Props {
  lifePlanId: string;
  familyMembers: FamilyMemberRow[];
  incomeRecords: IncomeRow[];
}

export default function IncomeSection({
  lifePlanId,
  familyMembers,
  incomeRecords: initialIncomeRecords,
}: Props) {
  const [incomeRecords, setIncomeRecords] = useState(initialIncomeRecords);
  const [addModal, setAddModal] = useState<{
    memberId: string;
    memberName: string;
  } | null>(null);
  const [editModal, setEditModal] = useState<IncomeRow | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    startYear: number;
  } | null>(null);

  const handleAddClose = () => {
    setAddModal(null);
  };

  const handleEditClose = () => {
    setEditModal(null);
  };

  const addActionWithState = async (prevState: unknown, formData: FormData) => {
    if (!addModal) return { 成功: false, エラー: 'エラーが発生しました' };

    const result = await 収入追加(
      lifePlanId,
      addModal.memberId,
      prevState,
      formData
    );

    if (result?.成功 && result.データ) {
      handleAddClose();
      setIncomeRecords([...incomeRecords, result.データ as IncomeRow]);
    }

    return result;
  };

  const updateActionWithState = async (
    prevState: unknown,
    formData: FormData
  ) => {
    if (!editModal) return { 成功: false, エラー: 'エラーが発生しました' };

    const result = await 収入更新(editModal.id, prevState, formData);

    if (result?.成功 && result.データ) {
      handleEditClose();
      setIncomeRecords(
        incomeRecords.map((r) =>
          r.id === editModal.id ? (result.データ as IncomeRow) : r
        )
      );
    }

    return result;
  };

  const handleDeleteConfirm = (incomeId: string, startYear: number) => {
    setDeleteConfirm({ id: incomeId, startYear });
  };

  const handleDeleteExecute = async () => {
    if (!deleteConfirm) return;

    try {
      await 収入削除(deleteConfirm.id);
      setIncomeRecords(incomeRecords.filter((r) => r.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting income:', err);
    }
  };

  return (
    <>
      <div className="mt-8 pt-8 border-t">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          家族メンバー
        </h2>
        {familyMembers && familyMembers.length > 0 ? (
          <div className="space-y-6">
            {familyMembers.map((member) => {
              const memberIncomes = incomeRecords.filter(
                (income) => income.family_member_id === member.family_member_id
              );

              return (
                <div
                  key={member.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="mb-4 flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {member.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {member.relationship}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setAddModal({
                          memberId: member.family_member_id,
                          memberName: member.name,
                        })
                      }
                      className="text-primary hover:text-primary-hover inline-flex items-center gap-1 text-sm"
                    >
                      <Plus size={16} />
                      収入を追加
                    </button>
                  </div>

                  {memberIncomes.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">
                        年別収入情報
                      </p>
                      {memberIncomes.map((income) => (
                        <div
                          key={income.id}
                          className="p-3 bg-white rounded border border-gray-100"
                        >
                          <div className="space-y-3 text-sm mb-2">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-gray-600">期間</p>
                                <p className="font-medium text-gray-900">
                                  {income.start_year}
                                  {income.end_year && `～${income.end_year}`}年
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">月給</p>
                                <p className="font-medium text-gray-900">
                                  ¥
                                  {income.monthly_salary?.toLocaleString() || 0}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-600">ボーナス</p>
                              <p className="font-medium text-gray-900">
                                {income.bonus_months > 0
                                  ? `月給の${income.bonus_months}ヶ月分 (${income.bonus_payment_months
                                      .split(',')
                                      .filter(Boolean)
                                      .map((m) => `${m}月`)
                                      .join('・')})`
                                  : 'なし'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">昇給率</p>
                              <p className="font-medium text-gray-900">
                                {(
                                  (income.expected_raise_rate || 0) * 100
                                ).toFixed(1)}
                                %
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setEditModal(income)}
                              className="text-primary hover:text-primary-hover inline-block"
                              title="編集"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteConfirm(
                                  income.id,
                                  income.start_year
                                )
                              }
                              className="inline-block hover:opacity-70 transition-opacity"
                              title="削除"
                              style={{ color: '#F28379' }}
                            >
                              <Trash2 size={18} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      年別収入が設定されていません
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">家族メンバーが登録されていません</p>
        )}
      </div>

      <FamilyMemberModal
        isOpen={!!addModal}
        onClose={handleAddClose}
        title={addModal ? `${addModal.memberName}の収入を追加` : '収入を追加'}
      >
        <IncomeForm action={addActionWithState} />
      </FamilyMemberModal>

      <FamilyMemberModal
        isOpen={!!editModal}
        onClose={handleEditClose}
        title="収入を編集"
      >
        <IncomeForm action={updateActionWithState} defaultValues={editModal} />
      </FamilyMemberModal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="収入を削除しますか？"
        message={`${deleteConfirm?.startYear}年の収入情報を削除します。この操作は取り消せません。`}
        confirmText="削除"
        cancelText="キャンセル"
        isDangerous={true}
        onConfirm={handleDeleteExecute}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}
