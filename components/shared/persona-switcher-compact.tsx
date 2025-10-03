"use client";

import { useCoachStore } from "@/lib/stores/coach-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Lock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPersonaAccentTextClass, getPersonaIcon } from "@/lib/constants/persona-icons";
import { useEntitlements } from "@/lib/hooks/use-entitlements";

export function PersonaSwitcherCompact() {
  const personas = useCoachStore((state) => state.personas);
  const activePersonaId = useCoachStore((state) => state.activePersonaId);
  const actions = useCoachStore((state) => state.actions);
  const { hasEntitlement, loading } = useEntitlements();

  const activePersona = personas.find((p) => p.id === activePersonaId);
  const activePersonaIdSafe = activePersona?.id ?? "marcus";
  const ActiveIcon = getPersonaIcon(activePersonaIdSafe);
  const activeAccentClass = getPersonaAccentTextClass(activePersonaIdSafe);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 persona-card border-persona/40">
          <ActiveIcon className={cn("size-4", activeAccentClass)} aria-hidden />
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
          const Icon = getPersonaIcon(persona.id);
          const accentTextClass = getPersonaAccentTextClass(persona.id);
          const productId = persona.id === "marcus" ? null : `coach-${persona.id}`;
          const isUnlocked = productId ? hasEntitlement(productId) : true;

          return (
            <DropdownMenuItem
              key={persona.id}
              onSelect={(event) => {
                if (!isUnlocked) {
                  event.preventDefault();
                  return;
                }
                actions.selectPersona(persona.id);
              }}
              className={cn("w-full py-3", !isUnlocked && "opacity-60 cursor-not-allowed")}
            >
              <div className="flex w-full items-start gap-3">
                <Icon
                  className={cn("mt-0.5 size-4", isUnlocked ? accentTextClass : "text-muted-foreground")}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn("text-sm font-serif font-semibold", isUnlocked ? accentTextClass : "text-muted-foreground")}
                    >
                      {persona.name}
                    </span>
                    {isActive && isUnlocked && (
                      <Check className="size-3.5 text-muted-foreground ml-auto" />
                    )}
                  </div>
                  <p className="text-2xs text-muted-foreground leading-snug">{persona.title}</p>
                </div>
                {!isUnlocked && !loading && <Lock className="size-3.5 text-muted-foreground" />}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
