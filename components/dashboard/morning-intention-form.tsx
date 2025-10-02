"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDailyProgress } from "@/lib/hooks/use-daily-progress";
import { useSetIntentionMutation } from "@/lib/hooks/use-daily-progress";
import { useOfflineDraft } from "@/lib/hooks/use-offline-draft";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import {
  selectDailyProgressActions,
  useDailyProgressStore,
} from "@/lib/stores/daily-progress-store";

export function MorningIntentionForm() {
  const { isLoading } = useDailyProgress();
  const mutation = useSetIntentionMutation();
  const actions = useDailyProgressStore(selectDailyProgressActions);
  const currentDate = useDailyProgressStore((state) => state.date);
  const intentionSnapshot = useDailyProgressStore((state) => state.intention ?? "");
  const { capture: track } = useAnalytics();

  const draft = useOfflineDraft<string>({
    key: `intention:${currentDate}`,
    initialValue: intentionSnapshot,
    serialize: (value) => value,
    deserialize: (value) => value,
  });

  const hasChanges = draft.hasDraft;
  const isSaving = mutation.isPending;

  return (
    <section className="philosophy-card p-6 parchment-texture animate-fade-in-up">
      <header className="space-y-2">
        <p className="text-2xs uppercase tracking-[0.35em] text-muted-foreground font-medium">
          Morning intention
        </p>
        <h2 className="text-3xl font-serif font-semibold text-gradient-philosophy">Set the tone for the day</h2>
      </header>
      <form
        className="mt-5 flex flex-col gap-3 text-sm"
        onSubmit={(event) => {
          event.preventDefault();
          const nextIntention = draft.value.trim();

          mutation.mutate(nextIntention, {
            onSuccess: () => {
              actions.setIntention(nextIntention);
              draft.clear(nextIntention);
              toast.success("Intention saved for today");
              track("intention_saved", {
                date: currentDate,
                length: nextIntention.length,
                empty: nextIntention.length === 0,
              });
            },
            onError: (err) => {
              toast.error(err instanceof Error ? err.message : "Unable to save intention");
              track("intention_save_failed", {
                date: currentDate,
                message: err instanceof Error ? err.message : String(err),
              });
            },
          });
        }}
      >
        <Input
          value={draft.value}
          onChange={(event) => {
            const nextValue = event.target.value;
            draft.setValue(nextValue);
          }}
          placeholder={isLoading ? "Loading intention…" : "Name the focus for your day"}
          disabled={isSaving || isLoading}
          className="border-philosophy-scroll bg-philosophy-marble/50 focus:border-primary/50 transition-all"
        />
        <div className="flex items-center justify-end">
          <Button 
            type="submit" 
            size="sm" 
            disabled={isSaving || isLoading || !hasChanges}
            className="shadow-philosophy transition-all hover:shadow-philosophy-lg"
          >
            {isSaving ? "Saving…" : hasChanges ? "Save intention" : "Saved"}
          </Button>
        </div>
      </form>
    </section>
  );
}
