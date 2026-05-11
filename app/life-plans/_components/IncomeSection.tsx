'use client';

import { useState } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import FamilyMemberModal from '@/app/family/_components/FamilyMemberModal';
import ConfirmDialog from '@/app/family/_components/ConfirmDialog';
import IncomeForm from './IncomeForm';
import IncomeTermForm from './IncomeTermForm';
import HobbyActivityForm from './HobbyActivityForm';
import HobbyActivityTermForm from './HobbyActivityTermForm';
import AnnualCostForm from './AnnualCostForm';
import {
  収入追加,
  収入更新,
  収入削除,
  収入期間追加,
  収入期間更新,
  収入期間削除,
} from '@/app/actions/income';
import {
  習い事追加,
  習い事削除,
  習い事月謝追加,
  習い事月謝更新,
  習い事月謝削除,
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

interface IncomeRecord {
  id: string;
  life_plan_id: string;
  family_member_id: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

interface IncomeTerm {
  id: string;
  income_record_id: string;
  monthly_salary: number;
  bonus_months: number;
  bonus_payment_months: string;
  expected_raise_rate: number;
  start_year: number;
  end_year: number | null;
  created_at: string;
  updated_at: string;
}

interface HobbyActivity {
  id: string;
  life_plan_id: string;
  family_member_id: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

interface HobbyActivityTerm {
  id: string;
  hobby_activity_id: string;
  monthly_fee: number;
  start_year: number;
  end_year: number | null;
  created_at: string;
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
  incomeRecords: IncomeRecord[];
  incomeTerms: IncomeTerm[];
  hobbyActivities: HobbyActivity[];
  hobbyActivityTerms: HobbyActivityTerm[];
  annualCosts: AnnualCostRow[];
}

export default function IncomeSection({
  lifePlanId,
  familyMembers,
  incomeRecords: initialIncomeRecords,
  incomeTerms: initialIncomeTerms,
  hobbyActivities: initialHobbyActivities,
  hobbyActivityTerms: initialHobbyActivityTerms,
  annualCosts: initialAnnualCosts,
}: Props) {
  const [incomeRecords, setIncomeRecords] = useState(initialIncomeRecords);
  const [incomeTerms, setIncomeTerms] = useState(initialIncomeTerms);
  const [hobbyActivities, setHobbyActivities] = useState(
    initialHobbyActivities
  );
  const [hobbyActivityTerms, setHobbyActivityTerms] = useState(
    initialHobbyActivityTerms
  );
  const [annualCosts, setAnnualCosts] = useState(initialAnnualCosts);

  const [addIncomeModal, setAddIncomeModal] = useState<{
    memberId: string;
    memberName: string;
  } | null>(null);
  const [editIncomeModal, setEditIncomeModal] = useState<IncomeRecord | null>(
    null
  );
  const [addIncomeTermModal, setAddIncomeTermModal] = useState<{
    recordId: string;
    recordName: string;
  } | null>(null);
  const [editIncomeTermModal, setEditIncomeTermModal] =
    useState<IncomeTerm | null>(null);
  const [addHobbyModal, setAddHobbyModal] = useState<{
    memberId: string;
    memberName: string;
  } | null>(null);
  const [addHobbyTermModal, setAddHobbyTermModal] = useState<{
    activityId: string;
    activityName: string;
  } | null>(null);
  const [editHobbyTermModal, setEditHobbyTermModal] =
    useState<HobbyActivityTerm | null>(null);
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
    type:
      | 'income_record'
      | 'income_term'
      | 'hobby_activity'
      | 'hobby_term'
      | 'cost';
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
      setIncomeRecords([...incomeRecords, result.データ as IncomeRecord]);
    }

    return result;
  };

  const updateIncomeActionWithState = async (
    prevState: unknown,
    formData: FormData
  ) => {
    if (!editIncomeModal)
      return { 成功: false, エラー: 'エラーが発生しました' };

    const result = await 収入更新(editIncomeModal.id, prevState, formData);

    if (result?.成功 && result.データ) {
      setEditIncomeModal(null);
      const updatedData = result.データ as { name: string | null };
      setIncomeRecords(
        incomeRecords.map((r) =>
          r.id === editIncomeModal.id ? { ...r, name: updatedData.name } : r
        )
      );
    }

    return result;
  };

  const addIncomeTermActionWithState = async (
    prevState: unknown,
    formData: FormData
  ) => {
    if (!addIncomeTermModal)
      return { 成功: false, エラー: 'エラーが発生しました' };

    const result = await 収入期間追加(
      addIncomeTermModal.recordId,
      lifePlanId,
      prevState,
      formData
    );

    if (result?.成功 && result.データ) {
      setAddIncomeTermModal(null);
      setIncomeTerms([...incomeTerms, result.データ as IncomeTerm]);
    }

    return result;
  };

  const updateIncomeTermActionWithState = async (
    prevState: unknown,
    formData: FormData
  ) => {
    if (!editIncomeTermModal)
      return { 成功: false, エラー: 'エラーが発生しました' };

    const result = await 収入期間更新(
      editIncomeTermModal.id,
      prevState,
      formData
    );

    if (result?.成功 && result.データ) {
      setEditIncomeTermModal(null);
      setIncomeTerms(
        incomeTerms.map((t) =>
          t.id === editIncomeTermModal.id ? (result.データ as IncomeTerm) : t
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
      setHobbyActivities([...hobbyActivities, result.データ as HobbyActivity]);
    }

    return result;
  };

  const addHobbyTermActionWithState = async (
    prevState: unknown,
    formData: FormData
  ) => {
    if (!addHobbyTermModal)
      return { 成功: false, エラー: 'エラーが発生しました' };

    const result = await 習い事月謝追加(
      addHobbyTermModal.activityId,
      lifePlanId,
      prevState,
      formData
    );

    if (result?.成功 && result.データ) {
      setAddHobbyTermModal(null);
      setHobbyActivityTerms([
        ...hobbyActivityTerms,
        result.データ as HobbyActivityTerm,
      ]);
    }

    return result;
  };

  const updateHobbyTermActionWithState = async (
    prevState: unknown,
    formData: FormData
  ) => {
    if (!editHobbyTermModal)
      return { 成功: false, エラー: 'エラーが発生しました' };

    const result = await 習い事月謝更新(
      editHobbyTermModal.id,
      prevState,
      formData
    );

    if (result?.成功 && result.データ) {
      setEditHobbyTermModal(null);
      setHobbyActivityTerms(
        hobbyActivityTerms.map((t) =>
          t.id === editHobbyTermModal.id
            ? (result.データ as HobbyActivityTerm)
            : t
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

    const result = await 年次費用更新(
      editCostModal.id,
      lifePlanId,
      prevState,
      formData
    );

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
    type:
      | 'income_record'
      | 'income_term'
      | 'hobby_activity'
      | 'hobby_term'
      | 'cost'
  ) => {
    setDeleteConfirm({ id, label, type });
  };

  const handleDeleteExecute = async () => {
    if (!deleteConfirm) return;

    try {
      if (deleteConfirm.type === 'income_record') {
        await 収入削除(deleteConfirm.id);
        setIncomeRecords(
          incomeRecords.filter((r) => r.id !== deleteConfirm.id)
        );
        setIncomeTerms(
          incomeTerms.filter(
            (t) =>
              t.income_record_id !==
              incomeRecords.find((r) => r.id === deleteConfirm.id)?.id
          )
        );
      } else if (deleteConfirm.type === 'income_term') {
        await 収入期間削除(deleteConfirm.id);
        setIncomeTerms(incomeTerms.filter((t) => t.id !== deleteConfirm.id));
      } else if (deleteConfirm.type === 'hobby_activity') {
        await 習い事削除(deleteConfirm.id);
        setHobbyActivities(
          hobbyActivities.filter((h) => h.id !== deleteConfirm.id)
        );
        setHobbyActivityTerms(
          hobbyActivityTerms.filter(
            (t) =>
              t.hobby_activity_id !==
              hobbyActivities.find((h) => h.id === deleteConfirm.id)?.id
          )
        );
      } else if (deleteConfirm.type === 'hobby_term') {
        await 習い事月謝削除(deleteConfirm.id);
        setHobbyActivityTerms(
          hobbyActivityTerms.filter((t) => t.id !== deleteConfirm.id)
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
              const memberIncomeRecords = incomeRecords.filter(
                (r) => r.family_member_id === member.family_member_id
              );
              const memberHobbyActivities = hobbyActivities.filter(
                (h) => h.family_member_id === member.family_member_id
              );

              return (
                <div
                  key={member.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="mb-4">
                    <p className="font-semibold text-gray-900">{member.name}</p>
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

                      {memberIncomeRecords.length > 0 ? (
                        <div className="space-y-3">
                          {memberIncomeRecords.map((record) => {
                            const recordTerms = incomeTerms.filter(
                              (t) => t.income_record_id === record.id
                            );

                            return (
                              <div
                                key={record.id}
                                className="p-3 bg-white rounded border border-gray-100"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  {record.name && (
                                    <p className="font-medium text-gray-900">
                                      {record.name}
                                    </p>
                                  )}
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setEditIncomeModal(record)}
                                      className="text-primary hover:text-primary-hover inline-block"
                                      title="編集"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteActivity(
                                          record.id,
                                          record.name || '収入グループ',
                                          'income_record'
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

                                {recordTerms.length > 0 ? (
                                  <div className="space-y-2 mb-2">
                                    {recordTerms.map((term) => (
                                      <div
                                        key={term.id}
                                        className="p-2 bg-gray-50 rounded text-sm"
                                      >
                                        <div className="space-y-2 mb-2">
                                          <div className="grid grid-cols-2 gap-3">
                                            <div>
                                              <p className="text-gray-600">
                                                期間
                                              </p>
                                              <p className="font-medium text-gray-900">
                                                {`${term.start_year} 年〜`}
                                                {term.end_year &&
                                                  `${term.end_year} 年`}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-gray-600">
                                                月給
                                              </p>
                                              <p className="font-medium text-gray-900">
                                                ¥
                                                {term.monthly_salary?.toLocaleString() ||
                                                  0}
                                              </p>
                                            </div>
                                          </div>
                                          <div>
                                            <p className="text-gray-600">
                                              ボーナス
                                            </p>
                                            <p className="font-medium text-gray-900">
                                              {term.bonus_months > 0
                                                ? (() => {
                                                    const months =
                                                      term.bonus_payment_months
                                                        .split(',')
                                                        .filter(Boolean)
                                                        .map((m) => `${m} 月`);
                                                    if (months.length === 1) {
                                                      return `月給の ${term.bonus_months} ヶ月分を${months[0]}に支給`;
                                                    }
                                                    return `月給の ${term.bonus_months} ヶ月分をそれぞれ ${months.join(
                                                      'と'
                                                    )} に支給`;
                                                  })()
                                                : 'なし'}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-gray-600">
                                              昇給率
                                            </p>
                                            <p className="font-medium text-gray-900">
                                              {(
                                                (term.expected_raise_rate ||
                                                  0) * 100
                                              ).toFixed(1)}
                                              %
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                          <button
                                            onClick={() =>
                                              setEditIncomeTermModal(term)
                                            }
                                            className="text-primary hover:text-primary-hover inline-block"
                                            title="編集"
                                          >
                                            <Edit2 size={16} />
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDeleteActivity(
                                                term.id,
                                                `${term.start_year}年の収入`,
                                                'income_term'
                                              )
                                            }
                                            className="inline-block hover:opacity-70 transition-opacity"
                                            title="削除"
                                            style={{ color: '#F28379' }}
                                          >
                                            <Trash2
                                              size={16}
                                              strokeWidth={2.5}
                                            />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-500 mb-2">
                                    期間が設定されていません
                                  </p>
                                )}

                                <button
                                  onClick={() =>
                                    setAddIncomeTermModal({
                                      recordId: record.id,
                                      recordName: record.name || '収入グループ',
                                    })
                                  }
                                  className="text-xs text-primary hover:text-primary-hover inline-flex items-center gap-1"
                                >
                                  <Plus size={12} />
                                  給与体系を追加
                                </button>
                              </div>
                            );
                          })}
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

                      {memberHobbyActivities.length > 0 ? (
                        <div className="space-y-3">
                          {memberHobbyActivities.map((activity) => {
                            const activityTerms = hobbyActivityTerms.filter(
                              (t) => t.hobby_activity_id === activity.id
                            );
                            const activityCosts = annualCosts.filter(
                              (c) => c.hobby_activity_id === activity.id
                            );

                            return (
                              <div
                                key={activity.id}
                                className="p-3 bg-white rounded border border-gray-100"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <p className="font-medium text-gray-900">
                                    {activity.name || '習い事'}
                                  </p>
                                  <button
                                    onClick={() =>
                                      handleDeleteActivity(
                                        activity.id,
                                        activity.name || '習い事',
                                        'hobby_activity'
                                      )
                                    }
                                    className="inline-block hover:opacity-70 transition-opacity"
                                    title="削除"
                                    style={{ color: '#F28379' }}
                                  >
                                    <Trash2 size={18} strokeWidth={2.5} />
                                  </button>
                                </div>

                                {activityTerms.length > 0 && (
                                  <div className="mb-3 space-y-2">
                                    <p className="text-xs font-medium text-gray-600">
                                      月謝
                                    </p>
                                    {activityTerms.map((term) => (
                                      <div
                                        key={term.id}
                                        className="p-2 bg-gray-50 rounded flex justify-between items-center text-xs"
                                      >
                                        <div>
                                          <p className="text-gray-700">
                                            {term.start_year}
                                            {term.end_year &&
                                              `～${term.end_year}`}
                                            年
                                          </p>
                                          <p className="font-medium text-gray-900">
                                            ¥
                                            {term.monthly_fee?.toLocaleString() ||
                                              0}
                                          </p>
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() =>
                                              setEditHobbyTermModal(term)
                                            }
                                            className="text-primary hover:text-primary-hover inline-block"
                                          >
                                            <Edit2 size={14} />
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDeleteActivity(
                                                term.id,
                                                `月謝 ${term.start_year}年`,
                                                'hobby_term'
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
                                    <button
                                      onClick={() =>
                                        setAddHobbyTermModal({
                                          activityId: activity.id,
                                          activityName:
                                            activity.name || '習い事',
                                        })
                                      }
                                      className="text-xs text-primary hover:text-primary-hover inline-flex items-center gap-1"
                                    >
                                      <Plus size={12} />
                                      月謝体系を追加
                                    </button>
                                  </div>
                                )}
                                {activityTerms.length === 0 && (
                                  <div className="mb-1">
                                    <button
                                      onClick={() =>
                                        setAddHobbyTermModal({
                                          activityId: activity.id,
                                          activityName:
                                            activity.name || '習い事',
                                        })
                                      }
                                      className="text-xs text-primary hover:text-primary-hover inline-flex items-center gap-1"
                                    >
                                      <Plus size={12} />
                                      月謝体系を追加
                                    </button>
                                  </div>
                                )}

                                {activityCosts.length > 0 && (
                                  <div className="pt-3 border-t border-gray-200">
                                    <p className="text-xs font-medium text-gray-600 mb-2">
                                      年次費用
                                    </p>
                                    <div className="space-y-1">
                                      {activityCosts.map((cost) => (
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
                                          activityId: activity.id,
                                          activityName:
                                            activity.name || '習い事',
                                        })
                                      }
                                      className="text-xs text-primary hover:text-primary-hover mt-2 inline-flex items-center gap-1"
                                    >
                                      <Plus size={12} />
                                      年次費用を追加
                                    </button>
                                  </div>
                                )}
                                {activityCosts.length === 0 && (
                                  <div className="mt-1">
                                    <button
                                      onClick={() =>
                                        setAddCostModal({
                                          activityId: activity.id,
                                          activityName:
                                            activity.name || '習い事',
                                        })
                                      }
                                      className="text-xs text-primary hover:text-primary-hover inline-flex items-center gap-1"
                                    >
                                      <Plus size={12} />
                                      年次費用を追加
                                    </button>
                                  </div>
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
        title={
          addIncomeModal
            ? `${addIncomeModal.memberName}の収入を追加`
            : '収入を追加'
        }
      >
        <IncomeForm action={addIncomeActionWithState} />
      </FamilyMemberModal>

      <FamilyMemberModal
        isOpen={!!editIncomeModal}
        onClose={() => setEditIncomeModal(null)}
        title="収入グループを編集"
      >
        <IncomeForm
          action={updateIncomeActionWithState}
          defaultValues={editIncomeModal ?? undefined}
        />
      </FamilyMemberModal>

      <FamilyMemberModal
        isOpen={!!addIncomeTermModal}
        onClose={() => setAddIncomeTermModal(null)}
        title={
          addIncomeTermModal
            ? `${addIncomeTermModal.recordName}に給与体系を追加`
            : '給与体系を追加'
        }
      >
        <IncomeTermForm action={addIncomeTermActionWithState} />
      </FamilyMemberModal>

      <FamilyMemberModal
        isOpen={!!editIncomeTermModal}
        onClose={() => setEditIncomeTermModal(null)}
        title="給与体系を編集"
      >
        <IncomeTermForm
          action={updateIncomeTermActionWithState}
          defaultValues={editIncomeTermModal ?? undefined}
        />
      </FamilyMemberModal>

      <FamilyMemberModal
        isOpen={!!addHobbyModal}
        onClose={() => setAddHobbyModal(null)}
        title={
          addHobbyModal
            ? `${addHobbyModal.memberName}の習い事を追加`
            : '習い事を追加'
        }
      >
        <HobbyActivityForm action={addHobbyActionWithState} />
      </FamilyMemberModal>

      <FamilyMemberModal
        isOpen={!!addHobbyTermModal}
        onClose={() => setAddHobbyTermModal(null)}
        title={
          addHobbyTermModal
            ? `${addHobbyTermModal.activityName}の月謝期間を追加`
            : '月謝期間を追加'
        }
      >
        <HobbyActivityTermForm action={addHobbyTermActionWithState} />
      </FamilyMemberModal>

      <FamilyMemberModal
        isOpen={!!editHobbyTermModal}
        onClose={() => setEditHobbyTermModal(null)}
        title="月謝期間を編集"
      >
        <HobbyActivityTermForm
          action={updateHobbyTermActionWithState}
          defaultValues={editHobbyTermModal ?? undefined}
        />
      </FamilyMemberModal>

      <FamilyMemberModal
        isOpen={!!addCostModal}
        onClose={() => setAddCostModal(null)}
        title={
          addCostModal
            ? `${addCostModal.activityName}の年次費用を追加`
            : '年次費用を追加'
        }
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
          deleteConfirm?.type === 'income_record'
            ? '収入グループを削除しますか？'
            : deleteConfirm?.type === 'income_term'
              ? '収入期間を削除しますか？'
              : deleteConfirm?.type === 'hobby_activity'
                ? '習い事を削除しますか？'
                : deleteConfirm?.type === 'hobby_term'
                  ? '月謝期間を削除しますか？'
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
