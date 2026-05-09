'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  status?: 'processing' | 'completed';
  duration?: number;
  minDuration?: number;
}

interface Props {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function Toast({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-0 pointer-events-none">
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
          index={index}
          totalCount={toasts.length}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
  index: number;
  totalCount: number;
}

function ToastItem({ toast, onRemove, index, totalCount }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // duration が undefined の場合は自動消去しない（開発用）
    if (toast.duration === undefined) return;

    const duration = toast.duration;
    const minDuration = (toast.minDuration || 0) * 1000;
    const displayTime = Math.max(duration, minDuration);

    const timer = setTimeout(() => {
      setIsExiting(true);
      const exitTimer = setTimeout(() => onRemove(toast.id), 200);
      return () => clearTimeout(exitTimer);
    }, displayTime);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, toast.minDuration, onRemove]);

  const bgColor =
    toast.type === 'success'
      ? 'bg-[#D9D1C7]'
      : toast.type === 'error'
        ? 'bg-error'
        : 'bg-[#D9D1C7]';

  const textColor =
    toast.type === 'success' || toast.type === 'info'
      ? 'text-gray-900'
      : 'text-white';

  const scaleClass =
    toast.type === 'success' ? (isExiting ? 'scale-95' : 'scale-100') : '';

  const isNewest = index === totalCount - 1;
  const isStacked = totalCount > 1 && index < totalCount - 1;

  const translateClass = isNewest
    ? isExiting
      ? 'translate-y-0'
      : 'translate-y-full'
    : isStacked
      ? '-translate-y-1'
      : 'translate-y-0';

  return (
    <div
      className={`${bgColor} ${textColor} px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 min-w-[250px] transition-all duration-300 ease-out pointer-events-auto ${scaleClass} ${translateClass} ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onRemove(toast.id), 200);
        }}
        className="hover:opacity-75 transition-opacity"
      >
        <X size={18} />
      </button>
    </div>
  );
}
