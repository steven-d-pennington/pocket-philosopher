"use client";

import Link from "next/link";

import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHabits } from "@/lib/hooks/use-habits";
import { selectUIActions, useUIStore } from "@/lib/stores/ui-store";

export function HabitsOverview() {
  const { data, isLoading, error } = useHabits();
  const actions = useUIStore(selectUIActions);

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Virtue habits</p>
          <h2 className="text-2xl font-semibold">Active routines</h2>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={() => actions.openModal("createHabit")}
          >
            <PlusCircle className="size-4" aria-hidden />
            New habit
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/habits">View all</Link>
          </Button>
        </div>
      </header>
      <div className="mt-6 space-y-2 text-sm text-muted-foreground">
        {isLoading && <p>Loading habits…</p>}
        {error && <p>Unable to load habits. Check Supabase API routes.</p>}
        {data && data.length === 0 && <p>No habits yet—use the New habit button to add one.</p>}
        {data && data.length > 0 ? (
          <ul className="grid gap-2">
            {data.slice(0, 4).map((habit) => (
              <li
                key={habit.id}
                className="rounded-2xl border border-dashed border-border/70 px-4 py-3 text-foreground"
              >
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{habit.name}</span>
                  <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                    {habit.virtue}
                  </span>
                </div>
                {habit.description ? (
                  <p className="text-xs text-muted-foreground">{habit.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
