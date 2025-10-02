"use client";

import { useCoachStore } from "@/lib/stores/coach-store";
import { usePersonaTheme } from "@/lib/hooks/use-persona-theme";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function PersonaSwitcher() {
  const personas = useCoachStore((state) => state.personas);
  const activePersonaId = useCoachStore((state) => state.activePersonaId);
  const actions = useCoachStore((state) => state.actions);
  const { theme } = usePersonaTheme();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {personas.map((persona) => {
        const isActive = persona.id === activePersonaId;
        const personaDivider = theme.decorative.divider;
        
        return (
          <Button
            key={persona.id}
            variant={isActive ? "default" : "outline"}
            onClick={() => actions.selectPersona(persona.id)}
            className={`
              relative h-auto flex-col items-start gap-2 p-4 text-left transition-all
              ${isActive ? 'persona-gradient-bg border-persona shadow-lg' : 'hover:border-persona/50'}
            `}
          >
            {isActive && (
              <Check className="absolute right-3 top-3 size-4 persona-accent" />
            )}
            <div className="flex items-center gap-2 w-full">
              <span className="text-lg persona-accent">{personaDivider}</span>
              <span className="font-serif font-semibold">{persona.name}</span>
            </div>
            <span className="text-xs text-muted-foreground font-normal">
              {persona.title}
            </span>
            <p className="text-xs text-muted-foreground/80 font-normal leading-relaxed">
              {persona.description}
            </p>
          </Button>
        );
      })}
    </div>
  );
}
