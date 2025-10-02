"use client";

import { useMemo } from "react";

import { Quote } from "lucide-react";
import { usePersonaTheme } from "@/lib/hooks/use-persona-theme";
import { useCoachStore } from "@/lib/stores/coach-store";
import { getDailyQuote } from "@/lib/constants/persona-quotes";

export function DailyQuote() {
  const { theme, personaId } = usePersonaTheme();
  const activePersonaId = useCoachStore((state) => state.activePersonaId);
  
  const quote = useMemo(() => {
    return getDailyQuote(activePersonaId || personaId);
  }, [activePersonaId, personaId]);

  return (
    <section className="rounded-2xl border-persona persona-gradient-bg p-6 shadow-philosophy animate-fade-in-up parchment-texture">
      <div className="flex items-start gap-4">
        <Quote className="size-8 persona-accent flex-shrink-0 mt-1" aria-hidden />
        <div className="space-y-4 flex-1">
          <p className="philosophy-quote text-xl text-foreground leading-relaxed pl-3">
            {quote.text}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            <p className="uppercase tracking-[0.32em] text-muted-foreground font-medium">
              {quote.author}
            </p>
            <span className="persona-accent text-lg">{theme.decorative.accentSymbol}</span>
            <p className="uppercase tracking-[0.32em] text-muted-foreground font-medium">
              {quote.tradition}
            </p>
            <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
