'use client';

import { useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export default function FamilyMemberModal({
  isOpen,
  onClose,
  children,
  title,
}: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-end overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-white w-screen sm:w-96 max-h-[100dvh] sm:max-h-[90vh] sm:rounded-lg shadow-lg animate-in slide-in-from-right-96 duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-4 py-6 sm:px-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none ml-4"
          >
            ×
          </button>
        </div>
        <div className="px-4 py-6 sm:px-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
