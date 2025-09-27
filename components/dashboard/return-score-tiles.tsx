"use client";

import { Flame, Sparkles, Target } from "lucide-react";

import { useDailyProgress } from "@/lib/hooks/use-daily-progress";

const virtueLabels: Record<string, string> = {
  wisdom: "Wisdom",
  justice: "Justice",
  temperance: "Temperance",
  courage: "Courage",
};

export function ReturnScoreTiles() {
  const { data, isLoading } = useDailyProgress();

  const returnScore = data?.returnScore ?? null;
  const streakDays = data?.streakDays ?? 0;
  const virtueScores = data?.virtueScores ?? {};

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Return Score</p>
          <h2 className="text-2xl font-semibold">Momentum snapshot</h2>
        </div>
        <Sparkles className="size-5 text-primary" aria-hidden />
      </header>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Today</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {isLoading ? "—" : returnScore !== null ? Math.round(returnScore) : "Pending"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Aggregated from practice completion, reflection cadence, and virtue balance.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Streak</p>
          <div className="mt-2 flex items-baseline gap-2">
            <Flame className="size-5 text-orange-500" aria-hidden />
            <p className="text-3xl font-semibold text-foreground">{streakDays}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Consecutive days logging practices or reflections.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        {Object.entries(virtueLabels).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between rounded-2xl border border-border/60 px-4 py-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
              <p className="text-sm text-muted-foreground">Weighted from the past 7 days.</p>
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Target className="size-4 text-primary" aria-hidden />
              <span>
                {isLoading
                  ? "—"
                  : virtueScores[key] !== null && typeof virtueScores[key] === "number"
                    ? Math.round((virtueScores[key] ?? 0) * 10) / 10
                    : "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
