"use client";

import { Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePersonaTheme } from "@/lib/hooks/use-persona-theme";
import { useCoachStore } from "@/lib/stores/coach-store";
import { getSuggestedPractice } from "@/lib/constants/persona-practices";
import { usePracticeModalStore } from "@/lib/stores/practice-modal-store";

const suggestionDifficultyMap = {
  beginner: "easy",
  intermediate: "medium",
  advanced: "hard",
} as const;

export function PersonaSuggestedPractice() {
  const { theme, personaId } = usePersonaTheme();
  const activePersonaId = useCoachStore((state) => state.activePersonaId);
  const modalActions = usePracticeModalStore((state) => state.actions);
  
  const suggestion = getSuggestedPractice(activePersonaId || personaId);
  const persona = useCoachStore((state) => 
    state.personas.find((p) => p.id === (activePersonaId || personaId))
  );

  const handleCreatePractice = () => {
    modalActions.openCreate({
      name: suggestion.name,
      description: suggestion.description,
      virtue: suggestion.virtue,
      frequency: suggestion.frequency,
      difficulty: suggestionDifficultyMap[suggestion.difficulty],
    });
  };

  return (
    <section className="persona-card p-6 shadow-philosophy animate-fade-in-up">
      <header className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="size-6 persona-accent flex-shrink-0 mt-1" aria-hidden />
          <div className="space-y-1">
            <p className="text-2xs uppercase tracking-[0.35em] text-muted-foreground font-medium">
              {persona?.name}&apos;s recommendation
            </p>
            <h2 className="text-xl font-serif font-semibold flex items-center gap-2">
              <span className="persona-accent text-base">{theme.decorative.divider}</span>
              Suggested practice
            </h2>
          </div>
        </div>
        <span className={`
          rounded-full px-3 py-1 text-2xs uppercase tracking-[0.24em] font-medium
          ${suggestion.difficulty === 'beginner' ? 'bg-green-500/10 text-green-700 dark:text-green-400' : ''}
          ${suggestion.difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' : ''}
          ${suggestion.difficulty === 'advanced' ? 'bg-red-500/10 text-red-700 dark:text-red-400' : ''}
        `}>
          {suggestion.difficulty}
        </span>
      </header>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-serif font-semibold text-foreground mb-1">
            {suggestion.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {suggestion.description}
          </p>
        </div>

        <div className="rounded-2xl border border-persona/40 bg-muted/20 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xs uppercase tracking-[0.28em] text-muted-foreground font-medium">
              Why {persona?.name} recommends this:
            </span>
          </div>
          <p className="text-sm text-foreground italic leading-relaxed">
            &ldquo;{suggestion.rationale}&rdquo;
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Virtue:</span>
            <span className="persona-accent font-medium uppercase tracking-wider">
              {suggestion.virtue}
            </span>
          </div>
          <span className="text-muted-foreground">{theme.decorative.bulletPoint}</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Frequency:</span>
            <span className="capitalize text-foreground font-medium">
              {suggestion.frequency}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            onClick={handleCreatePractice}
            className="w-full gap-2"
          >
            <span>{theme.decorative.accentSymbol}</span>
            Add this practice to my routine
          </Button>
        </div>
      </div>
    </section>
  );
}
