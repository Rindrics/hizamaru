import { useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
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
      minDuration = 0
    ) => {
      const id = Math.random().toString(36).substr(2, 9);
      const toast: ToastMessage = { id, message, type, duration, minDuration };
      setToasts((prev) => [...prev, toast]);
      return id;
    },
    []
  );

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number, minDuration?: number) =>
      add(message, 'success', duration, minDuration),
    [add]
  );

  const error = useCallback(
    (message: string, duration?: number, minDuration?: number) =>
      add(message, 'error', duration, minDuration),
    [add]
  );

  const info = useCallback(
    (message: string, minDuration?: number, duration?: number) =>
      add(message, 'info', duration, minDuration),
    [add]
  );

  return { toasts, add, remove, success, error, info };
}
