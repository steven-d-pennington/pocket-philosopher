"use client";

import { useMemo, useState, useEffect } from "react";

import { CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDailyProgress, usePracticeCompletionMutation } from "@/lib/hooks/use-daily-progress";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { usePractices } from "@/lib/hooks/use-practices";
import { useCommunityStore } from "@/lib/stores/community-store";
import { formatPracticeAchievement } from "@/lib/community/formatters";

export function PracticeQuickActions() {
  const { data: practicesData, isLoading: practicesLoading } = usePractices();
  const { data: progressData, isLoading: progressLoading } = useDailyProgress();
  const mutation = usePracticeCompletionMutation();
  const { capture: track } = useAnalytics();
  const { isEnabled: communityEnabled, openShareModal } = useCommunityStore();

  const completedIds = useMemo(
    () => new Set(progressData?.practicesCompleted ?? []),
    [progressData],
  );

  const visiblePractices = practicesData?.slice(0, 6) ?? [];

  // Milestone thresholds
  const MILESTONES = [3, 7, 30, 100];

  const checkMilestone = async (practiceId: string) => {
    // TODO: Fetch practice completion history to check streak
    // For now, we'll simulate milestone detection
    // In production, you'd query habit_logs to get the streak count
    
    try {
      const response = await fetch(`/api/practices/${practiceId}/streak`);
      if (!response.ok) return null;
      
      const data = await response.json();
      const streak = data.streak || 0;
      
      // Check if this completion hits a milestone
      const milestone = MILESTONES.find(m => streak === m);
      return milestone || null;
    } catch (error) {
      console.error("Failed to check milestone:", error);
      return null;
    }
  };

  const formatMilestoneContent = (practiceName: string, milestone: number, virtue?: string) => {
    return `🎉 **Milestone Achievement!**

I just completed **${milestone} days** of my practice: "${practiceName}"!

${virtue ? `This practice aligns with the virtue of **${virtue}**.` : ""}

Consistency is the path to growth. Each small step compounds into meaningful change.

#PracticeStreak #DailyProgress #PhilosophyInAction`;
  };

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
              onClick={async () => {
                const wasCompleted = isCompleted;
                
                mutation.mutate(
                  { practiceId: practice.id, completed: !isCompleted },
                  {
                    onError: (err) => {
                      toast.error(
                        err instanceof Error ? err.message : "Unable to update practice",
                      );
                    },
                    onSuccess: async () => {
                      track("practice_quick_toggle", {
                        practiceId: practice.id,
                        completed: !isCompleted,
                      });
                      
                      // Check for milestone if completing (not uncompleting) and community enabled
                      if (!wasCompleted && communityEnabled) {
                        const milestone = await checkMilestone(practice.id);
                        if (milestone) {
                          const formatted = formatPracticeAchievement({
                            practice_id: practice.id,
                            practice_name: practice.name,
                            achievement_type: 'milestone',
                            virtue: practice.virtue,
                            streak_days: milestone,
                          } as any);
                          openShareModal({
                            type: 'practice',
                            sourceId: practice.id,
                            sourceData: { practice, milestone },
                            previewData: formatted,
                          });
                          
                          track("practice_milestone_reached", {
                            practiceId: practice.id,
                            milestone,
                          });
                        }
                      }
                    },
                  },
                );
              }}
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
