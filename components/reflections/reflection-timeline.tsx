"use client";

import type { MouseEventHandler } from "react";

import { BookOpen, CalendarClock } from "lucide-react";
import { format, parseISO } from "date-fns";

import { usePersonaTheme } from "@/lib/hooks/use-persona-theme";
import type { Reflection } from "@/lib/hooks/use-reflections";

interface ReflectionTimelineProps {
  reflections: Reflection[];
  onSelect?: (reflection: Reflection) => void;
}

export function ReflectionTimeline({ reflections, onSelect }: ReflectionTimelineProps) {
  const { theme } = usePersonaTheme();

  if (!reflections.length) {
    return (
      <section className="persona-card p-6 shadow-philosophy text-sm text-muted-foreground">
        <p className="text-sm font-semibold font-serif text-foreground flex items-center gap-2">
          <span className="persona-accent">{theme.decorative.divider}</span>
          Reflection timeline
        </p>
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
    <section className="space-y-4 persona-card p-6 shadow-philosophy">
      <header className="flex items-center gap-2">
        <BookOpen className="size-5 persona-accent" aria-hidden />
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Timeline</p>
          <h2 className="text-xl font-semibold font-serif flex items-center gap-2">
            <span className="persona-accent text-base">{theme.decorative.divider}</span>
            Recent reflections
          </h2>
        </div>
      </header>
      <ol className="space-y-4 text-sm">
        {sorted.map((reflection) => {
          const timestamp = parseISO(reflection.updatedAt);
          return (
            <li key={reflection.id} className="rounded-2xl border border-persona/40 bg-muted/10 p-4 hover:border-persona/70 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                  <span className="persona-accent">{reflection.type}</span>
                  <span className="persona-accent">{theme.decorative.bulletPoint}</span>
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
                  className="mt-3 text-xs font-medium persona-accent underline underline-offset-4 hover:opacity-70 transition-opacity"
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
