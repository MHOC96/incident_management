"use client";

import { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  onDismiss: () => void;
};

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 z-[60] max-w-[min(20rem,calc(100vw-2rem))] rounded-md border border-success/30 bg-surface px-4 py-3 text-sm [bottom:max(1.5rem,env(safe-area-inset-bottom))]"
    >
      <p className="text-success">{message}</p>
    </div>
  );
}

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  return {
    message,
    showToast: (nextMessage: string) => setMessage(nextMessage),
    dismissToast: () => setMessage(null),
  };
}
