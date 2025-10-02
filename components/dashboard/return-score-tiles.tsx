"use client";

import { Flame, Sparkles, Target } from "lucide-react";

import { useDailyProgress } from "@/lib/hooks/use-daily-progress";
import { usePersonaTheme } from "@/lib/hooks/use-persona-theme";

const virtueLabels: Record<string, string> = {
  wisdom: "Wisdom",
  justice: "Justice",
  temperance: "Temperance",
  courage: "Courage",
};

export function ReturnScoreTiles() {
  const { data, isLoading } = useDailyProgress();
  const { theme } = usePersonaTheme();

  const returnScore = data?.returnScore ?? null;
  const streakDays = data?.streakDays ?? 0;
  const virtueScores = data?.virtueScores ?? {};

  return (
    <section className="persona-card p-6 animate-fade-in-up">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-2xs uppercase tracking-[0.35em] text-muted-foreground font-medium">Return Score</p>
          <h2 className="text-2xl font-serif font-semibold">Momentum snapshot</h2>
        </div>
        <Sparkles className="size-6 persona-accent animate-glow" aria-hidden />
      </header>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/5 to-transparent p-4 text-sm transition-all hover:border-primary/20 hover:shadow-philosophy">
          <p className="text-2xs uppercase tracking-[0.32em] text-muted-foreground font-medium">Today</p>
          <p className="mt-3 text-4xl font-display font-semibold text-foreground tracking-tight">
            {isLoading ? "—" : returnScore !== null ? Math.round(returnScore) : "Pending"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Aggregated from practice completion, reflection cadence, and virtue balance.
          </p>
        </div>
        <div className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-4 text-sm transition-all hover:border-accent/30 hover:shadow-philosophy">
          <p className="text-2xs uppercase tracking-[0.32em] text-muted-foreground font-medium">Streak</p>
          <div className="mt-3 flex items-baseline gap-2">
            <Flame className="size-6 text-orange-500 animate-glow" aria-hidden />
            <p className="text-4xl font-display font-semibold text-foreground tracking-tight">{streakDays}</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Consecutive days logging practices or reflections.
          </p>
        </div>
      </div>
      <div className="philosophy-divider mt-6 mb-4">
        <span className="philosophy-divider-ornament text-2xl persona-accent">{theme.decorative.divider}</span>
      </div>
      <div className="grid gap-2.5 text-sm sm:grid-cols-2">
        {Object.entries(virtueLabels).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between rounded-xl border border-border/40 bg-philosophy-scroll/30 px-4 py-3 transition-all hover:border-primary/30 hover:bg-philosophy-scroll/50">
            <div className="space-y-0.5">
              <p className="text-2xs uppercase tracking-[0.32em] text-muted-foreground font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">Past 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-xl font-display font-semibold text-foreground">
              <Target className="size-4 text-primary" aria-hidden />
              <span>
                {isLoading
                  ? "—"
                  : virtueScores[key] !== null && typeof virtueScores[key] === "number"
                    ? Math.round((virtueScores[key] ?? 0) * 10) / 10
                    : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
