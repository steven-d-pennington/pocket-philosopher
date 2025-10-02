"use client";

import { useCoachStore } from "@/lib/stores/coach-store";
import { getDailyInsight } from "@/lib/constants/persona-insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Clock } from "lucide-react";

/**
 * Daily Insight Card
 * 
 * Displays a daily philosophical insight tailored to the active persona.
 * The insight changes daily and provides practical wisdom.
 */
export function DailyInsight() {
  const activePersonaId = useCoachStore((state) => state.activePersonaId);
  const personas = useCoachStore((state) => state.personas);
  const activePersona = personas.find((p) => p.id === activePersonaId);

  const insight = getDailyInsight(activePersonaId);

  // Category badges
  const categoryColors = {
    mindset: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    practice: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    wisdom: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    reflection: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    action: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  };

  return (
    <Card className="overflow-hidden border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-5 text-primary" />
            <CardTitle className="text-base font-semibold">
              Daily Insight from {activePersona?.name}
            </CardTitle>
          </div>
          {insight.timeframe && (
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <Clock className="size-3" />
              {insight.timeframe}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">{insight.title}</h3>
          <span
            className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[insight.category]}`}
          >
            {insight.category}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{insight.content}</p>
      </CardContent>
    </Card>
  );
}
