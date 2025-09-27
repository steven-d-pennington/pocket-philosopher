"use client";

import type { MouseEventHandler } from "react";

import { BookOpen, CalendarClock } from "lucide-react";
import { format, parseISO } from "date-fns";

import type { Reflection } from "@/lib/hooks/use-reflections";

interface ReflectionTimelineProps {
  reflections: Reflection[];
  onSelect?: (reflection: Reflection) => void;
}

export function ReflectionTimeline({ reflections, onSelect }: ReflectionTimelineProps) {
  if (!reflections.length) {
    return (
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm text-sm text-muted-foreground">
        <p className="text-sm font-semibold text-foreground">Reflection timeline</p>
        <p className="mt-2">Entries will appear here once you start journaling.</p>
      </section>
    );
  }

  const handleSelect = (reflection: Reflection): MouseEventHandler<HTMLButtonElement> => (event) => {
    event.preventDefault();
    onSelect?.(reflection);
  };

  const sorted = [...reflections].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <header className="flex items-center gap-2">
        <BookOpen className="size-5 text-primary" aria-hidden />
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Timeline</p>
          <h2 className="text-xl font-semibold">Recent reflections</h2>
        </div>
      </header>
      <ol className="space-y-4 text-sm">
        {sorted.map((reflection) => {
          const timestamp = parseISO(reflection.updatedAt);
          return (
            <li key={reflection.id} className="rounded-2xl border border-border/60 bg-muted/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                  <span>{reflection.type}</span>
                  <span>•</span>
                  <span>{reflection.virtueFocus ?? "No virtue"}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="size-4" aria-hidden />
                  <span>{format(timestamp, "MMM d, yyyy • h:mm a")}</span>
                </div>
              </div>
              {reflection.journalEntry ? (
                <p className="mt-3 text-sm text-foreground">{reflection.journalEntry}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {typeof reflection.mood === "number" ? (
                  <span className="rounded-full border border-border/60 px-2 py-0.5">Mood {reflection.mood}/10</span>
                ) : null}
                {reflection.keyInsights?.length ? (
                  <span className="rounded-full border border-border/60 px-2 py-0.5">
                    {reflection.keyInsights.length} insight{reflection.keyInsights.length === 1 ? "" : "s"}
                  </span>
                ) : null}
                {reflection.winsCelebrated?.length ? (
                  <span className="rounded-full border border-border/60 px-2 py-0.5">
                    {reflection.winsCelebrated.length} win{reflection.winsCelebrated.length === 1 ? "" : "s"}
                  </span>
                ) : null}
              </div>
              {onSelect ? (
                <button
                  type="button"
                  className="mt-3 text-xs font-medium text-primary underline underline-offset-4"
                  onClick={handleSelect(reflection)}
                >
                  Load into composer
                </button>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
