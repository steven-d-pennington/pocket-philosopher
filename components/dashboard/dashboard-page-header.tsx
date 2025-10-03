"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { usePersonaTheme } from "@/lib/hooks/use-persona-theme";

interface DashboardPageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

export function DashboardPageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: DashboardPageHeaderProps) {
  const { theme } = usePersonaTheme();
  
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-4 pb-6 mb-2",
        className,
      )}
    >
      <div className="space-y-3">
        {eyebrow ? (
          <div className="flex items-center gap-2">
            <span className="text-lg persona-accent">{theme.decorative.accentSymbol}</span>
            <p className="text-2xs uppercase tracking-[0.35em] persona-accent font-medium">
              {eyebrow}
            </p>
          </div>
        ) : null}
        <div className="space-y-2">
          <h1 className="text-5xl font-display font-bold tracking-tight sm:text-6xl text-gradient-persona">
            {title}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed font-light">
            {description}
          </p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
