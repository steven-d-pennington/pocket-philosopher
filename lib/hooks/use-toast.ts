import { useCallback } from "react";
import { toast as sonnerToast } from "sonner";

interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "info";
}

export function useToast() {
  const toast = useCallback(({ title, description, variant = "default" }: Toast) => {
    const message = description ? `${title}: ${description}` : title;

    switch (variant) {
      case "destructive":
        sonnerToast.error(title, { description });
        break;
      case "success":
        sonnerToast.success(title, { description });
        break;
      case "info":
        sonnerToast.info(title, { description });
        break;
      default:
        sonnerToast(title, { description });
    }
  }, []);

  return {
    toast,
    success: (title: string, description?: string) => toast({ title, description, variant: "success" }),
    error: (title: string, description?: string) => toast({ title, description, variant: "destructive" }),
    info: (title: string, description?: string) => toast({ title, description, variant: "info" }),
  };
}
