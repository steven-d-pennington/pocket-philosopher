import { useState, useCallback } from "react";

interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = "default" }: Toast) => {
    // For now, just use console.log
    // In a real implementation, this would show a toast notification
    if (variant === "destructive") {
      console.error(`[Toast] ${title}${description ? `: ${description}` : ""}`);
    } else {
      console.log(`[Toast] ${title}${description ? `: ${description}` : ""}`);
    }

    // You can integrate with a proper toast library like sonner or react-hot-toast
    setToasts((prev) => [...prev, { title, description, variant }]);
  }, []);

  return { toast, toasts };
}
