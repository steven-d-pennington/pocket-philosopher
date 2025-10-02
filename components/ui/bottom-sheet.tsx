"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSwipe } from "@/lib/hooks/use-swipe";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  showHandle?: boolean;
}

/**
 * Bottom Sheet Component - Mobile-optimized modal
 *
 * Features:
 * - Slides up from bottom on mobile
 * - Swipe down to dismiss
 * - Full-height on desktop (regular modal)
 * - Smooth animations
 * - Accessibility support
 *
 * @example
 * ```tsx
 * <BottomSheet
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Create Practice"
 * >
 *   <form>...</form>
 * </BottomSheet>
 * ```
 */
export function BottomSheet({
  open,
  onClose,
  title,
  description,
  children,
  className,
  showHandle = true,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setIsAnimating(true);
      // Lock body scroll
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    } else {
      // Delay unmounting for exit animation
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Keyboard handling
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Swipe to close
  const swipeHandlers = useSwipe({
    onSwipedDown: () => {
      if (open) {
        onClose();
      }
    },
    delta: 50,
  });

  if (!mounted || (!open && !isAnimating)) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4",
        "transition-opacity duration-300",
        open ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "bottom-sheet-title" : undefined}
        aria-describedby={description ? "bottom-sheet-description" : undefined}
        className={cn(
          "relative w-full max-w-2xl",
          "bg-card shadow-2xl",
          "transform transition-transform duration-300 ease-out",
          // Mobile: slide from bottom, rounded top corners
          "max-h-[90vh] rounded-t-3xl md:max-h-[85vh] md:rounded-3xl",
          open ? "translate-y-0" : "translate-y-full md:translate-y-0 md:scale-95",
          className,
        )}
        {...swipeHandlers}
      >
        {/* Drag Handle (mobile only) */}
        {showHandle && (
          <div className="flex justify-center py-3 md:hidden">
            <div className="h-1.5 w-12 rounded-full bg-muted touch-manipulation" aria-hidden="true" />
          </div>
        )}

        {/* Header */}
        {(title || description) && (
          <div className="border-b border-border/60 px-6 pb-4 pt-2 md:pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {title && (
                  <h2
                    id="bottom-sheet-title"
                    className="font-display text-xl font-semibold leading-tight md:text-2xl"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="bottom-sheet-description" className="mt-1.5 text-sm text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="size-10 shrink-0 touch-manipulation no-tap-highlight"
                aria-label="Close"
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto px-6 py-6 max-h-[calc(90vh-8rem)] md:max-h-[calc(85vh-8rem)]">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
