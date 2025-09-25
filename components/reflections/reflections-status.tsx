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
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Reflections</p>
          <h2 className="text-2xl font-semibold">Intentional journaling</h2>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/reflections">
            Open reflections
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </header>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {["morning", "midday", "evening"].map((slot) => {
          const completed = reflections[slot as keyof typeof reflections];
          return (
            <div
              key={slot}
              className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground"
            >
              <p className="text-xs uppercase tracking-[0.32em]">{slot}</p>
              <p className="text-base font-semibold text-foreground">
                {isLoading ? "Loading…" : completed ? "Complete" : "Pending"}
              </p>
              <p className="mt-2 text-xs">
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
