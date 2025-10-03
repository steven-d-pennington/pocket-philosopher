"use client";

import { useMemo } from "react";

import { CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDailyProgress, usePracticeCompletionMutation } from "@/lib/hooks/use-daily-progress";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { usePractices } from "@/lib/hooks/use-practices";

export function PracticeQuickActions() {
  const { data: practicesData, isLoading: practicesLoading } = usePractices();
  const { data: progressData, isLoading: progressLoading } = useDailyProgress();
  const mutation = usePracticeCompletionMutation();
  const { capture: track } = useAnalytics();

  const completedIds = useMemo(
    () => new Set(progressData?.practicesCompleted ?? []),
    [progressData],
  );

  const visiblePractices = practicesData?.slice(0, 6) ?? [];

  return (
    <section className="philosophy-card p-6 animate-fade-in-up">
      <header className="space-y-2">
        <p className="text-2xs uppercase tracking-[0.35em] text-muted-foreground font-medium">Quick log</p>
        <h2 className="text-3xl font-serif font-semibold">Tap practices as you complete them</h2>
      </header>
      <div className="mt-6 flex flex-col gap-3.5 px-2">
        {(practicesLoading || progressLoading) && (
          <p className="text-xs text-muted-foreground">Loading practices…</p>
        )}
        {!practicesLoading && visiblePractices.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No practices yet. Create one to start logging progress.
          </p>
        ) : null}
        {visiblePractices.map((practice) => {
          const isCompleted = completedIds.has(practice.id);
          const Icon = isCompleted ? CheckCircle2 : Circle;

          return (
            <Button
              key={practice.id}
              type="button"
              variant="ghost"
              className={cn(
                "group relative flex w-full items-center justify-between rounded-xl border px-6 py-3.5 text-left text-sm transition-all",
                isCompleted
                  ? "border-primary/30 bg-primary/10 shadow-sm"
                  : "border-border/70 bg-card/70 hover:border-primary/30 hover:bg-card"
              )}
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate(
                  { practiceId: practice.id, completed: !isCompleted },
                  {
                    onError: (err) => {
                      toast.error(
                        err instanceof Error ? err.message : "Unable to update practice",
                      );
                    },
                    onSuccess: () => {
                      track("practice_quick_toggle", {
                        practiceId: practice.id,
                        completed: !isCompleted,
                      });
                    },
                  },
                )
              }
            >
              <span className="flex flex-col gap-0.5 text-left">
                <span className={cn("font-semibold", isCompleted ? "text-primary" : "text-foreground")}>{practice.name}</span>
                {practice.description ? (
                  <span className="text-xs text-muted-foreground leading-relaxed">{practice.description}</span>
                ) : null}
              </span>
              <Icon className={cn("size-5 flex-shrink-0 transition-colors", isCompleted ? "text-primary" : "text-muted-foreground")} aria-hidden />
            </Button>
          );
        })}
      </div>
    </section>
  );
}
