"use client";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDailyProgress } from "@/lib/hooks/use-daily-progress";

export function ReflectionsStatus() {
  const { data, isLoading } = useDailyProgress();

  const reflections = data?.reflections ?? {
    morning: false,
    midday: false,
    evening: false,
  };

  return (
    <section className="philosophy-card p-6 animate-fade-in-up">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-2xs uppercase tracking-[0.35em] text-muted-foreground font-medium">Reflections</p>
          <h2 className="text-2xl font-serif font-semibold">Intentional journaling</h2>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-2 hover:bg-philosophy-scroll/50">
          <Link href="/reflections">
            Open reflections
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </header>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {["morning", "midday", "evening"].map((slot) => {
          const completed = reflections[slot as keyof typeof reflections];
          return (
            <div
              key={slot}
              className="rounded-xl border border-border/40 bg-philosophy-scroll/30 p-4 text-sm text-muted-foreground transition-all hover:border-primary/30"
            >
              <p className="text-2xs uppercase tracking-[0.32em] font-medium">{slot}</p>
              <p className="text-lg font-display font-semibold text-foreground mt-2">
                {isLoading ? "Loading…" : completed ? "Complete" : "Pending"}
              </p>
              <p className="mt-2 text-xs leading-relaxed">
                {completed
                  ? "Captured reflections are ready for analytics."
                  : "Jot a quick reflection to keep your Return Score grounded."}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
