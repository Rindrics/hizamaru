'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit2, Trash2 } from 'lucide-react';
import type { 家族メンバー } from '@/types';
import { 家族メンバー削除 } from '@/app/actions/familyMembers';
import FamilyMemberModal from './FamilyMemberModal';
import FamilyMemberForm from './FamilyMemberForm';
import ConfirmDialog from './ConfirmDialog';
import { 家族メンバー追加 } from '@/app/actions/familyMembers';

interface Props {
  members: 家族メンバー[];
  accountId?: string;
}

export default function FamilyMemberList({ members }: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ja-JP');
  };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleAddClose = () => {
    setIsAddOpen(false);
  };

  const addActionWithState = async (prevState: unknown, formData: FormData) => {
    const result = await 家族メンバー追加(prevState, formData);
    if (result?.成功 === false) {
      return result;
    }
    return null;
  };

  const handleDeleteConfirm = (memberId: string) => {
    const member = members.find((m) => m.ID === memberId);
    if (member) {
      setDeleteConfirm({ id: memberId, name: member.名前 });
    }
  };

  const handleDeleteExecute = async () => {
    if (!deleteConfirm) return;
    await 家族メンバー削除(deleteConfirm.id);
  };

  return (
    <>
      <div className="p-6 flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">メンバー一覧</h3>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-primary text-primary-text px-4 py-2 rounded-md hover:bg-primary-hover"
        >
          + 追加
        </button>
      </div>
      <div className="px-6 pb-6">
        {members.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            家族メンバーが登録されていません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    名前
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    続柄
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    生年月日
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    年齢
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.ID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {member.名前}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {member.続柄}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(member.生年月日)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {calculateAge(member.生年月日)}歳
                    </td>
                    <td className="px-6 py-4 text-sm space-x-3">
                      <Link
                        href={`/family/${member.ID}/edit`}
                        className="text-primary hover:text-primary-hover inline-block"
                        title="編集"
                      >
                        <Edit2 size={18} />
                      </Link>
                      <button
                        onClick={() => handleDeleteConfirm(member.ID)}
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
        title="家族メンバーを追加"
      >
        <FamilyMemberForm action={addActionWithState} />
      </FamilyMemberModal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="削除してよろしいですか？"
        message={`「${deleteConfirm?.name}」を削除します。この操作は取り消せません。`}
        confirmText="削除"
        cancelText="キャンセル"
        isDangerous
        onConfirm={() => {
          handleDeleteExecute();
          setDeleteConfirm(null);
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}
