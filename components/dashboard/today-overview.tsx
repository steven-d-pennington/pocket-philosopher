"use client";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDailyProgress } from "@/lib/hooks/use-daily-progress";

export function TodayOverview() {
  const { data, isLoading, error } = useDailyProgress();

  return (
    <section className="philosophy-card p-6 animate-fade-in-up">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-2xs uppercase tracking-[0.35em] text-muted-foreground font-medium">Today</p>
          <h2 className="text-2xl font-serif font-semibold">Daily practice snapshot</h2>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-2 hover:bg-philosophy-scroll/50">
          <Link href="/practices">
            Manage practices
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </header>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-border/40 bg-philosophy-scroll/30 p-4 text-sm text-muted-foreground">
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
                Practices completed:{" "}
                <span className="font-semibold">{data.practicesCompleted.length}</span>
              </p>
              <p className="text-sm">
                Return Score:{" "}
                <span className="font-semibold">
                  {data.returnScore !== null ? Math.round(data.returnScore) : "Pending"}
                </span>
              </p>
            </div>
          ) : (
            <p>No daily data yet—log a practice to kick things off.</p>
          )}
        </div>
        <div className="rounded-xl border border-border/40 bg-philosophy-scroll/30 p-4 text-sm text-muted-foreground">
          <p className="text-sm font-semibold text-foreground font-serif">Virtue balance (coming soon)</p>
          <p className="mt-2">
            As the analytics endpoints mature, this card will visualize Stoic, Taoist, and
            Existentialist progress derived from Supabase aggregations.
          </p>
        </div>
      </div>
    </section>
  );
}
