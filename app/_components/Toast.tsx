'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  minDuration?: number;
}

interface Props {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function Toast({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 3000;
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

  return (
    <div
      className={`${bgColor} ${textColor} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[250px] transition-all duration-300 ease-out ${
        isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
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
