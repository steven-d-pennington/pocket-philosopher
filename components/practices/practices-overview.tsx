"use client";

import Link from "next/link";

import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePractices } from "@/lib/hooks/use-practices";
import { selectUIActions, useUIStore } from "@/lib/stores/ui-store";

export function PracticesOverview() {
  const { data, isLoading, error } = usePractices();
  const actions = useUIStore(selectUIActions);

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Virtue practices</p>
          <h2 className="text-2xl font-semibold">Active routines</h2>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={() => actions.openModal("createPractice")}
          >
            <PlusCircle className="size-4" aria-hidden />
            New practice
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/practices">View all</Link>
          </Button>
        </div>
      </header>
      <div className="mt-6 space-y-2 text-sm text-muted-foreground">
        {isLoading && <p>Loading practices…</p>}
        {error && <p>Unable to load practices. Check Supabase API routes.</p>}
        {data && data.length === 0 && <p>No practices yet—use the New practice button to add one.</p>}
        {data && data.length > 0 ? (
          <ul className="grid gap-2">
            {data.slice(0, 4).map((practice) => (
              <li
                key={practice.id}
                className="rounded-2xl border border-dashed border-border/70 px-4 py-3 text-foreground"
              >
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{practice.name}</span>
                  <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                    {practice.virtue}
                  </span>
                </div>
                {practice.description ? (
                  <p className="text-xs text-muted-foreground">{practice.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
