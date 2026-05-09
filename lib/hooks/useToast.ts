import { useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  status?: 'processing' | 'completed';
  duration?: number;
  minDuration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const add = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'info' = 'info',
      duration = 3000,
      minDuration = 0,
      status?: 'processing' | 'completed'
    ) => {
      const id = Math.random().toString(36).substr(2, 9);
      const toast: ToastMessage = {
        id,
        message,
        type,
        status,
        duration,
        minDuration,
      };
      setToasts((prev) => [...prev, toast]);
      return id;
    },
    []
  );

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (
      message: string,
      minDurationSeconds?: number,
      status?: 'processing' | 'completed'
    ) =>
      add(
        message,
        'success',
        status === 'completed' ? 2500 : 3000,
        minDurationSeconds || 0,
        status
      ),
    [add]
  );

  const error = useCallback(
    (
      message: string,
      minDurationSeconds?: number,
      status?: 'processing' | 'completed'
    ) =>
      add(
        message,
        'error',
        status === 'completed' ? 2500 : 3000,
        minDurationSeconds || 0,
        status
      ),
    [add]
  );

  const info = useCallback(
    (
      message: string,
      minDurationSeconds?: number,
      status?: 'processing' | 'completed'
    ) =>
      add(
        message,
        'info',
        status === 'processing' ? 1500 : 3000,
        minDurationSeconds || 0,
        status
      ),
    [add]
  );

  return { toasts, add, remove, success, error, info };
}
