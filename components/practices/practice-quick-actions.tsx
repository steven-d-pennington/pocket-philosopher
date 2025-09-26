"use client";

import { useMemo } from "react";

import { CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Quick log</p>
        <h2 className="text-2xl font-semibold">Tap practices as you complete them</h2>
      </header>
      <div className="mt-5 grid gap-3">
        {(practicesLoading || progressLoading) && (
          <p className="text-sm text-muted-foreground">Loading practices…</p>
        )}
        {!practicesLoading && visiblePractices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
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
              variant={isCompleted ? "secondary" : "outline"}
              className="flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm"
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
              <span className="flex flex-col text-left">
                <span className="font-semibold text-foreground">{practice.name}</span>
                {practice.description ? (
                  <span className="text-xs text-muted-foreground">{practice.description}</span>
                ) : null}
              </span>
              <Icon className="size-5 text-primary" aria-hidden />
            </Button>
          );
        })}
      </div>
    </section>
  );
}
