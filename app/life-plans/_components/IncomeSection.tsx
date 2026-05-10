'use client';

import { useState } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import FamilyMemberModal from '@/app/family/_components/FamilyMemberModal';
import ConfirmDialog from '@/app/family/_components/ConfirmDialog';
import IncomeForm from './IncomeForm';
import HobbyActivityForm from './HobbyActivityForm';
import AnnualCostForm from './AnnualCostForm';
import {
  収入追加,
  収入更新,
  収入削除,
} from '@/app/actions/income';
import {
  習い事追加,
  習い事更新,
  習い事削除,
  年次費用追加,
  年次費用更新,
  年次費用削除,
} from '@/app/actions/hobbyActivities';

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

interface HobbyActivityRow {
  id: string;
  life_plan_id: string;
  family_member_id: string;
  name: string;
  monthly_fee: number;
  start_year: number;
  end_year: number | null;
  created_at: string;
  updated_at: string;
}

interface AnnualCostRow {
  id: string;
  hobby_activity_id: string;
  name: string;
  amount: number;
  start_year: number;
  end_year: number | null;
  times_per_year: number | null;
  created_at: string;
}

interface Props {
  lifePlanId: string;
  familyMembers: FamilyMemberRow[];
  incomeRecords: IncomeRow[];
  hobbyActivities: HobbyActivityRow[];
  annualCosts: AnnualCostRow[];
}

export default function IncomeSection({
  lifePlanId,
  familyMembers,
  incomeRecords: initialIncomeRecords,
  hobbyActivities: initialHobbyActivities,
  annualCosts: initialAnnualCosts,
}: Props) {
  const [incomeRecords, setIncomeRecords] = useState(initialIncomeRecords);
  const [hobbyActivities, setHobbyActivities] =
    useState(initialHobbyActivities);
  const [annualCosts, setAnnualCosts] = useState(initialAnnualCosts);

  const [addIncomeModal, setAddIncomeModal] = useState<{
    memberId: string;
    memberName: string;
  } | null>(null);
  const [editIncomeModal, setEditIncomeModal] = useState<IncomeRow | null>(
    null
  );
  const [addHobbyModal, setAddHobbyModal] = useState<{
    memberId: string;
    memberName: string;
  } | null>(null);
  const [editHobbyModal, setEditHobbyModal] = useState<HobbyActivityRow | null>(
    null
  );
  const [addCostModal, setAddCostModal] = useState<{
    activityId: string;
    activityName: string;
  } | null>(null);
  const [editCostModal, setEditCostModal] = useState<AnnualCostRow | null>(
    null
  );
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    label: string;
    type: 'income' | 'hobby' | 'cost';
  } | null>(null);

  const addIncomeActionWithState = async (
    prevState: unknown,
    formData: FormData
  ) => {
    if (!addIncomeModal) return { 成功: false, エラー: 'エラーが発生しました' };

    const result = await 収入追加(
      lifePlanId,
      addIncomeModal.memberId,
      prevState,
      formData
    );

    if (result?.成功 && result.データ) {
      setAddIncomeModal(null);
      setIncomeRecords([...incomeRecords, result.データ as IncomeRow]);
    }

    return result;
  };

  const updateIncomeActionWithState = async (
    prevState: unknown,
    formData: FormData
  ) => {
    if (!editIncomeModal) return { 成功: false, エラー: 'エラーが発生しました' };

    const result = await 収入更新(editIncomeModal.id, prevState, formData);

    if (result?.成功 && result.データ) {
      setEditIncomeModal(null);
      setIncomeRecords(
        incomeRecords.map((r) =>
          r.id === editIncomeModal.id ? (result.データ as IncomeRow) : r
        )
      );
    }

    return result;
  };

  const addHobbyActionWithState = async (
    prevState: unknown,
    formData: FormData
  ) => {
    if (!addHobbyModal) return { 成功: false, エラー: 'エラーが発生しました' };

    const result = await 習い事追加(
      lifePlanId,
      addHobbyModal.memberId,
      prevState,
      formData
    );

    if (result?.成功 && result.データ) {
      setAddHobbyModal(null);
      setHobbyActivities([...hobbyActivities, result.データ as HobbyActivityRow]);
    }

    return result;
  };

  const updateHobbyActionWithState = async (
    prevState: unknown,
    formData: FormData
  ) => {
    if (!editHobbyModal) return { 成功: false, エラー: 'エラーが発生しました' };

    const result = await 習い事更新(editHobbyModal.id, prevState, formData);

    if (result?.成功 && result.データ) {
      setEditHobbyModal(null);
      setHobbyActivities(
        hobbyActivities.map((h) =>
          h.id === editHobbyModal.id ? (result.データ as HobbyActivityRow) : h
        )
      );
    }

    return result;
  };

  const addCostActionWithState = async (
    prevState: unknown,
    formData: FormData
  ) => {
    if (!addCostModal) return { 成功: false, エラー: 'エラーが発生しました' };

    const result = await 年次費用追加(
      addCostModal.activityId,
      lifePlanId,
      prevState,
      formData
    );

    if (result?.成功 && result.データ) {
      setAddCostModal(null);
      setAnnualCosts([...annualCosts, result.データ as AnnualCostRow]);
    }

    return result;
  };

  const updateCostActionWithState = async (
    prevState: unknown,
    formData: FormData
  ) => {
    if (!editCostModal) return { 成功: false, エラー: 'エラーが発生しました' };

    const result = await 年次費用更新(editCostModal.id, lifePlanId, prevState, formData);

    if (result?.成功 && result.データ) {
      setEditCostModal(null);
      setAnnualCosts(
        annualCosts.map((c) =>
          c.id === editCostModal.id ? (result.データ as AnnualCostRow) : c
        )
      );
    }

    return result;
  };

  const handleDeleteActivity = (
    id: string,
    label: string,
    type: 'income' | 'hobby' | 'cost'
  ) => {
    setDeleteConfirm({ id, label, type });
  };

  const handleDeleteExecute = async () => {
    if (!deleteConfirm) return;

    try {
      if (deleteConfirm.type === 'income') {
        await 収入削除(deleteConfirm.id);
        setIncomeRecords(incomeRecords.filter((r) => r.id !== deleteConfirm.id));
      } else if (deleteConfirm.type === 'hobby') {
        await 習い事削除(deleteConfirm.id);
        setHobbyActivities(
          hobbyActivities.filter((h) => h.id !== deleteConfirm.id)
        );
      } else if (deleteConfirm.type === 'cost') {
        await 年次費用削除(deleteConfirm.id, lifePlanId);
        setAnnualCosts(annualCosts.filter((c) => c.id !== deleteConfirm.id));
      }
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting:', err);
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
              const memberHobbies = hobbyActivities.filter(
                (hobby) => hobby.family_member_id === member.family_member_id
              );

              return (
                <div
                  key={member.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="mb-4">
                    <p className="font-semibold text-gray-900">
                      {member.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {member.relationship}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-700">
                          年別収入情報
                        </p>
                        <button
                          onClick={() =>
                            setAddIncomeModal({
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
                        <div className="space-y-2">
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
                                      {`${income.start_year} 年〜`}
                                      {income.end_year &&
                                        `${income.end_year} 年`}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">月給</p>
                                    <p className="font-medium text-gray-900">
                                      ¥
                                      {income.monthly_salary?.toLocaleString() ||
                                        0}
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
                                  onClick={() => setEditIncomeModal(income)}
                                  className="text-primary hover:text-primary-hover inline-block"
                                  title="編集"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteActivity(
                                      income.id,
                                      `${income.start_year}年の収入`,
                                      'income'
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

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-700">
                          習い事
                        </p>
                        <button
                          onClick={() =>
                            setAddHobbyModal({
                              memberId: member.family_member_id,
                              memberName: member.name,
                            })
                          }
                          className="text-primary hover:text-primary-hover inline-flex items-center gap-1 text-sm"
                        >
                          <Plus size={16} />
                          習い事を追加
                        </button>
                      </div>

                      {memberHobbies.length > 0 ? (
                        <div className="space-y-2">
                          {memberHobbies.map((hobby) => {
                            const hobbyCosts = annualCosts.filter(
                              (c) => c.hobby_activity_id === hobby.id
                            );

                            return (
                              <div
                                key={hobby.id}
                                className="p-3 bg-white rounded border border-gray-100"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                      {hobby.name}
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 text-sm mt-2">
                                      <div>
                                        <p className="text-gray-600">月謝</p>
                                        <p className="font-medium text-gray-900">
                                          ¥
                                          {hobby.monthly_fee?.toLocaleString() ||
                                            0}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">期間</p>
                                        <p className="font-medium text-gray-900">
                                          {hobby.start_year}
                                          {hobby.end_year &&
                                            `～${hobby.end_year}`}
                                          年
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setEditHobbyModal(hobby)}
                                      className="text-primary hover:text-primary-hover inline-block"
                                      title="編集"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteActivity(
                                          hobby.id,
                                          hobby.name,
                                          'hobby'
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

                                {hobbyCosts.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs font-medium text-gray-600 mb-2">
                                      年次費用
                                    </p>
                                    <div className="space-y-1">
                                      {hobbyCosts.map((cost) => (
                                        <div
                                          key={cost.id}
                                          className="flex justify-between items-center text-xs"
                                        >
                                          <div>
                                            <p className="text-gray-700">
                                              {cost.name}
                                            </p>
                                            <p className="text-gray-500">
                                              {`${cost.start_year}年～`}
                                              {cost.end_year &&
                                                `${cost.end_year} 年`}
                                              {cost.times_per_year &&
                                                `（${cost.amount?.toLocaleString()} 円 を 年 ${cost.times_per_year} 回）`}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900">
                                              ¥
                                              {cost.amount?.toLocaleString() ||
                                                0}
                                            </p>
                                            <button
                                              onClick={() =>
                                                setEditCostModal(cost)
                                              }
                                              className="text-primary hover:text-primary-hover inline-block"
                                            >
                                              <Edit2 size={14} />
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleDeleteActivity(
                                                  cost.id,
                                                  cost.name,
                                                  'cost'
                                                )
                                              }
                                              className="inline-block hover:opacity-70"
                                              style={{ color: '#F28379' }}
                                            >
                                              <Trash2
                                                size={14}
                                                strokeWidth={2.5}
                                              />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    <button
                                      onClick={() =>
                                        setAddCostModal({
                                          activityId: hobby.id,
                                          activityName: hobby.name,
                                        })
                                      }
                                      className="text-xs text-primary hover:text-primary-hover mt-2 inline-flex items-center gap-1"
                                    >
                                      <Plus size={12} />
                                      年次費用を追加
                                    </button>
                                  </div>
                                )}

                                {hobbyCosts.length === 0 && (
                                  <button
                                    onClick={() =>
                                      setAddCostModal({
                                        activityId: hobby.id,
                                        activityName: hobby.name,
                                      })
                                    }
                                    className="text-xs text-primary hover:text-primary-hover mt-2 inline-flex items-center gap-1 text-black"
                                  >
                                    <Plus size={12} />
                                    年次費用を追加
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          習い事が登録されていません
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">家族メンバーが登録されていません</p>
        )}
      </div>

      <FamilyMemberModal
        isOpen={!!addIncomeModal}
        onClose={() => setAddIncomeModal(null)}
        title={addIncomeModal ? `${addIncomeModal.memberName}の収入を追加` : '収入を追加'}
      >
        <IncomeForm action={addIncomeActionWithState} />
      </FamilyMemberModal>

      <FamilyMemberModal
        isOpen={!!editIncomeModal}
        onClose={() => setEditIncomeModal(null)}
        title="収入を編集"
      >
        <IncomeForm
          action={updateIncomeActionWithState}
          defaultValues={editIncomeModal ?? undefined}
        />
      </FamilyMemberModal>

      <FamilyMemberModal
        isOpen={!!addHobbyModal}
        onClose={() => setAddHobbyModal(null)}
        title={addHobbyModal ? `${addHobbyModal.memberName}の習い事を追加` : '習い事を追加'}
      >
        <HobbyActivityForm action={addHobbyActionWithState} />
      </FamilyMemberModal>

      <FamilyMemberModal
        isOpen={!!editHobbyModal}
        onClose={() => setEditHobbyModal(null)}
        title="習い事を編集"
      >
        <HobbyActivityForm
          action={updateHobbyActionWithState}
          defaultValues={editHobbyModal ?? undefined}
        />
      </FamilyMemberModal>

      <FamilyMemberModal
        isOpen={!!addCostModal}
        onClose={() => setAddCostModal(null)}
        title={addCostModal ? `${addCostModal.activityName}の年次費用を追加` : '年次費用を追加'}
      >
        <AnnualCostForm action={addCostActionWithState} />
      </FamilyMemberModal>

      <FamilyMemberModal
        isOpen={!!editCostModal}
        onClose={() => setEditCostModal(null)}
        title="年次費用を編集"
      >
        <AnnualCostForm
          action={updateCostActionWithState}
          defaultValues={editCostModal ?? undefined}
        />
      </FamilyMemberModal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title={
          deleteConfirm?.type === 'income'
            ? '収入を削除しますか？'
            : deleteConfirm?.type === 'hobby'
              ? '習い事を削除しますか？'
              : '年次費用を削除しますか？'
        }
        message={`「${deleteConfirm?.label}」を削除します。この操作は取り消せません。`}
        confirmText="削除"
        cancelText="キャンセル"
        isDangerous={true}
        onConfirm={handleDeleteExecute}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}
