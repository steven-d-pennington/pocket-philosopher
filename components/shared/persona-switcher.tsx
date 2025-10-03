"use client";

import { useCoachStore } from "@/lib/stores/coach-store";
import { Button } from "@/components/ui/button";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPersonaAccentTextClass, getPersonaIcon } from "@/lib/constants/persona-icons";
import { useEntitlements } from "@/lib/hooks/use-entitlements";

export function PersonaSwitcher() {
  const personas = useCoachStore((state) => state.personas);
  const activePersonaId = useCoachStore((state) => state.activePersonaId);
  const actions = useCoachStore((state) => state.actions);
  const { hasEntitlement, loading } = useEntitlements();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {personas.map((persona) => {
        const isActive = persona.id === activePersonaId;
        const Icon = getPersonaIcon(persona.id);
        const accentTextClass = getPersonaAccentTextClass(persona.id);
        const productId = persona.id === "marcus" ? null : `coach-${persona.id}`;
        const isUnlocked = productId ? hasEntitlement(productId) : true;

        return (
          <Button
            key={persona.id}
            variant={isActive ? "default" : "outline"}
            onClick={() => {
              if (!isUnlocked) return;
              actions.selectPersona(persona.id);
            }}
            disabled={!isUnlocked}
            className={cn(
              "relative h-auto flex-col items-start gap-2 p-4 text-left transition-all",
              isActive && "persona-gradient-bg border-persona shadow-lg",
              !isActive && "hover:border-persona/50",
              !isUnlocked && "opacity-60 cursor-not-allowed"
            )}
          >
            {isActive && isUnlocked && (
              <Check className="absolute right-3 top-3 size-4 text-muted-foreground" />
            )}
            {!isUnlocked && !loading && (
              <Lock className="absolute right-3 top-3 size-4 text-muted-foreground" />
            )}
            <div className="flex items-center gap-2 w-full">
              <Icon
                className={cn("size-5", isUnlocked ? accentTextClass : "text-muted-foreground")}
              />
              <span className={cn("font-serif font-semibold", isUnlocked ? "text-foreground" : "text-muted-foreground")}>
                {persona.name}
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-normal">
              {persona.title}
            </span>
            <p className="text-xs text-muted-foreground/80 font-normal leading-relaxed">
              {persona.description}
            </p>
            {!isUnlocked && (
              <p className="text-[10px] text-muted-foreground mt-2">Requires coach access</p>
            )}
          </Button>
        );
      })}
    </div>
  );
}
