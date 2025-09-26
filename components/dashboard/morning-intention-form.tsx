"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDailyProgress } from "@/lib/hooks/use-daily-progress";
import { useSetIntentionMutation } from "@/lib/hooks/use-daily-progress";

export function MorningIntentionForm() {
  const { data, isLoading } = useDailyProgress();
  const [intention, setIntention] = useState("");
  const mutation = useSetIntentionMutation();

  useEffect(() => {
    if (data?.intention) {
      setIntention(data.intention);
    }
  }, [data?.intention]);

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
          Morning intention
        </p>
        <h2 className="text-2xl font-semibold">Set the tone for the day</h2>
      </header>
      <form
        className="mt-6 flex flex-col gap-3 text-sm"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate(intention, {
            onSuccess: () => {
              toast.success("Intention saved for today");
            },
            onError: (err) => {
              toast.error(err instanceof Error ? err.message : "Unable to save intention");
            },
          });
        }}
      >
        <Input
          value={intention}
          onChange={(event) => setIntention(event.target.value)}
          placeholder={isLoading ? "Loading intention…" : "Name the focus for your day"}
          disabled={mutation.isPending || isLoading}
        />
        <div className="flex items-center justify-end">
          <Button type="submit" size="sm" disabled={mutation.isPending || isLoading}>
            {mutation.isPending ? "Saving…" : "Save intention"}
          </Button>
        </div>
      </form>
    </section>
  );
}
