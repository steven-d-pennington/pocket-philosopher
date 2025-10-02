"use client";

import { useCoachStore } from "@/lib/stores/coach-store";
import { usePersonaTheme } from "@/lib/hooks/use-persona-theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, User } from "lucide-react";

export function PersonaSwitcherCompact() {
  const personas = useCoachStore((state) => state.personas);
  const activePersonaId = useCoachStore((state) => state.activePersonaId);
  const actions = useCoachStore((state) => state.actions);
  const { theme } = usePersonaTheme();

  const activePersona = personas.find((p) => p.id === activePersonaId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 persona-card border-persona/40">
          <span className="persona-accent text-base" aria-hidden>
            {theme.decorative.divider}
          </span>
          <span className="hidden sm:inline font-serif">{activePersona?.name}</span>
          <span className="sm:hidden">
            <User className="size-4" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-2xs uppercase tracking-[0.35em] text-muted-foreground font-medium">
          Philosophical Guide
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {personas.map((persona) => {
          const isActive = persona.id === activePersonaId;

          return (
            <DropdownMenuItem
              key={persona.id}
              onClick={() => actions.selectPersona(persona.id)}
              className="flex items-start gap-3 cursor-pointer py-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm persona-accent font-serif font-semibold">
                    {persona.name}
                  </span>
                  {isActive && <Check className="size-3.5 persona-accent ml-auto" />}
                </div>
                <p className="text-2xs text-muted-foreground">
                  {persona.title}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
