"use client";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDailyProgress } from "@/lib/hooks/use-daily-progress";

export function TodayOverview() {
  const { data, isLoading, error } = useDailyProgress();

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Today</p>
          <h2 className="text-2xl font-semibold">Daily practice snapshot</h2>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/habits">
            Manage habits
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </header>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
          {isLoading ? (
            <p>Loading daily progress…</p>
          ) : error ? (
            <p>Unable to load daily progress. Check your Supabase connection.</p>
          ) : data ? (
            <div className="space-y-2 text-foreground">
              <p>
                <span className="text-sm font-semibold">Morning intention:</span>{" "}
                {data.intention ? data.intention : "Not set yet"}
              </p>
              <p className="text-sm">
                Habits completed:{" "}
                <span className="font-semibold">{data.habitsCompleted.length}</span>
              </p>
              <p className="text-sm">
                Return Score:{" "}
                <span className="font-semibold">
                  {data.returnScore !== null ? Math.round(data.returnScore) : "Pending"}
                </span>
              </p>
            </div>
          ) : (
            <p>No daily data yet—log a habit to kick things off.</p>
          )}
        </div>
        <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
          <p className="text-sm font-semibold text-foreground">Virtue balance (coming soon)</p>
          <p className="mt-2">
            As the analytics endpoints mature, this card will visualize Stoic, Taoist, and
            Existentialist progress derived from Supabase aggregations.
          </p>
        </div>
      </div>
    </section>
  );
}
