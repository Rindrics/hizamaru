'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit2 } from 'lucide-react';
import FamilyMemberModal from '@/app/family/_components/FamilyMemberModal';
import ConfirmDialog from '@/app/family/_components/ConfirmDialog';
import Toast from '@/app/_components/Toast';
import { useToast } from '@/lib/hooks/useToast';
import {
  予算セット削除,
  予算セット作成,
  予算セット更新,
  予算カテゴリ削除,
  予算カテゴリ作成,
  予算カテゴリ更新,
} from '@/app/actions/budgets';
import BudgetSetForm from './BudgetSetForm';
import BudgetCategoryForm from './BudgetCategoryForm';
import BudgetAmountInput from './BudgetAmountInput';
import type { 予算カテゴリ, 予算セット, 予算 } from '@/types';

interface BudgetSetWithAmounts extends 予算セット {
  予算: 予算[];
}

interface Props {
  categories: 予算カテゴリ[];
  budgetSets: BudgetSetWithAmounts[];
  accountId: string;
}

export default function BudgetList({
  categories: initialCategories,
  budgetSets: initialBudgetSets,
}: Props) {
  const [isAddSetOpen, setIsAddSetOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    color: string;
  } | null>(null);
  const [editingSet, setEditingSet] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
    type: 'set' | 'category';
  } | null>(null);
  const { toasts, remove, error: showError, info, success } = useToast();
  const router = useRouter();

  const handleAddSetClose = () => {
    setIsAddSetOpen(false);
  };

  const handleAddCategoryClose = () => {
    setIsAddCategoryOpen(false);
  };

  const addSetAction = async (prevState: unknown, formData: FormData) => {
    const result = await 予算セット作成(prevState, formData);
    if (result?.成功 === false) {
      return result;
    }
    setIsAddSetOpen(false);
    success('セットを作成しました', 1.0, 'completed');
    setTimeout(() => router.refresh(), 1500);
    return null;
  };

  const addCategoryAction = async (prevState: unknown, formData: FormData) => {
    const result = await 予算カテゴリ作成(prevState, formData);
    if (result?.成功 === false) {
      return result;
    }
    setIsAddCategoryOpen(false);
    success('カテゴリを作成しました', 1.0, 'completed');
    setTimeout(() => router.refresh(), 1500);
    return null;
  };

  const editCategoryAction = async (prevState: unknown, formData: FormData) => {
    if (!editingCategory) return null;
    const result = await 予算カテゴリ更新(
      editingCategory.id,
      prevState,
      formData
    );
    if (result?.成功 === false) {
      return result;
    }
    setEditingCategory(null);
    success('カテゴリを更新しました', 1.0, 'completed');
    setTimeout(() => router.refresh(), 1500);
    return null;
  };

  const editSetAction = async (prevState: unknown, formData: FormData) => {
    if (!editingSet) return null;
    const result = await 予算セット更新(editingSet.id, prevState, formData);
    if (result?.成功 === false) {
      return result;
    }
    setEditingSet(null);
    success('セットを更新しました', 1.0, 'completed');
    setTimeout(() => router.refresh(), 1500);
    return null;
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    setDeleteConfirm({
      id: categoryId,
      name: categoryName,
      type: 'category',
    });
  };

  const handleDeleteSet = (setId: string, setName: string) => {
    setDeleteConfirm({
      id: setId,
      name: setName,
      type: 'set',
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      info('削除中...', 1.0, 'processing');
      if (deleteConfirm.type === 'set') {
        await 予算セット削除(deleteConfirm.id);
      } else {
        await 予算カテゴリ削除(deleteConfirm.id);
      }
      success('削除しました', 1.0, 'completed');
      setTimeout(() => router.refresh(), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      showError(`削除に失敗しました: ${message}`, 3.0);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const getBudgetAmount = (
    budgetSetId: string,
    categoryId: string
  ): number | null => {
    const set = initialBudgetSets.find((s) => s.ID === budgetSetId);
    if (!set) return null;
    const budget = set.予算.find((b) => b.予算カテゴリID === categoryId);
    return budget?.金額 ?? null;
  };

  return (
    <>
      <Toast toasts={toasts} onRemove={remove} />

      <div className="space-y-6">
        {/* Budget Categories Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">カテゴリ</h2>
            <button
              onClick={() => setIsAddCategoryOpen(true)}
              className="bg-primary text-primary-text px-4 py-2 rounded-md hover:bg-primary-hover"
            >
              + 追加
            </button>
          </div>
          {initialCategories.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              カテゴリが作成されていません
            </div>
          ) : (
            <div className="space-y-2">
              {initialCategories.map((category) => (
                <div
                  key={category.ID}
                  className="flex justify-between items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.色 || '#808080' }}
                    />
                    <span className="text-gray-900">{category.名前}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setEditingCategory({
                          id: category.ID,
                          name: category.名前,
                          color: category.色 || '#808080',
                        })
                      }
                      className="inline-block hover:opacity-70 transition-opacity p-1 text-primary"
                      title="編集"
                    >
                      <Edit2 size={18} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteCategory(category.ID, category.名前)
                      }
                      className="inline-block hover:opacity-70 transition-opacity p-1"
                      title="削除"
                      style={{ color: '#F28379' }}
                    >
                      <Trash2 size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Budget Sets Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">予算セット</h2>
            <button
              onClick={() => setIsAddSetOpen(true)}
              className="bg-primary text-primary-text px-4 py-2 rounded-md hover:bg-primary-hover"
            >
              + 追加
            </button>
          </div>

          {initialBudgetSets.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              予算セットが作成されていません
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {initialBudgetSets.map((set) => (
                <div
                  key={set.ID}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {set.名前}
                    </h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          setEditingSet({
                            id: set.ID,
                            name: set.名前,
                          })
                        }
                        className="inline-block hover:opacity-70 transition-opacity p-1 text-primary"
                        title="編集"
                      >
                        <Edit2 size={18} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDeleteSet(set.ID, set.名前)}
                        className="inline-block hover:opacity-70 transition-opacity p-1"
                        title="削除"
                        style={{ color: '#F28379' }}
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {initialCategories.map((category) => (
                      <BudgetAmountInput
                        key={`${set.ID}-${category.ID}`}
                        budgetSetId={set.ID}
                        categoryId={category.ID}
                        categoryName={category.名前}
                        categoryColor={category.色}
                        defaultAmount={getBudgetAmount(set.ID, category.ID)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <FamilyMemberModal
        isOpen={isAddSetOpen}
        onClose={handleAddSetClose}
        title="予算セットを追加"
      >
        <BudgetSetForm action={addSetAction} />
      </FamilyMemberModal>

      <FamilyMemberModal
        isOpen={isAddCategoryOpen}
        onClose={handleAddCategoryClose}
        title="カテゴリを追加"
      >
        <BudgetCategoryForm action={addCategoryAction} />
      </FamilyMemberModal>

      <FamilyMemberModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="カテゴリを編集"
      >
        <BudgetCategoryForm
          action={editCategoryAction}
          defaultValue={editingCategory?.name}
          defaultColor={editingCategory?.color}
          isEditing
        />
      </FamilyMemberModal>

      <FamilyMemberModal
        isOpen={!!editingSet}
        onClose={() => setEditingSet(null)}
        title="予算セットを編集"
      >
        <BudgetSetForm
          action={editSetAction}
          defaultValue={editingSet?.name}
          isEditing
        />
      </FamilyMemberModal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title={
          deleteConfirm?.type === 'set'
            ? '予算セットを削除しますか？'
            : 'カテゴリを削除しますか？'
        }
        message={
          deleteConfirm?.type === 'set'
            ? `「${deleteConfirm?.name}」を削除します。この操作は取り消せません。`
            : `「${deleteConfirm?.name}」を削除します。この操作は取り消せません。`
        }
        confirmText="削除"
        cancelText="キャンセル"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}
