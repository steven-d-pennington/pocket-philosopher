"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Eye, LayoutGrid } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DailyInsight } from "@/components/dashboard/daily-insight";
import { DailyQuote } from "@/components/dashboard/daily-quote";
import { MorningIntentionForm } from "@/components/dashboard/morning-intention-form";
import { PersonaSuggestedPractice } from "@/components/dashboard/persona-suggested-practice";
import { ReturnScoreTiles } from "@/components/dashboard/return-score-tiles";
import { TodayOverview } from "@/components/dashboard/today-overview";
import { WidgetWrapper } from "@/components/dashboard/widget-wrapper";
import { CoachPreview } from "@/components/marcus/coach-preview";
import { PracticeQuickActions } from "@/components/practices/practice-quick-actions";
import { PracticesOverview } from "@/components/practices/practices-overview";
import { ReflectionsStatus } from "@/components/reflections/reflections-status";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { useEntitlements } from "@/lib/hooks/use-entitlements";
import { useCoachStore } from "@/lib/stores/coach-store";
import {
  useDashboardPreferences,
  selectDashboardActions,
  selectWidgetVisibility,
} from "@/lib/stores/dashboard-preferences-store";

export function TodayPageClient() {
  const searchParams = useSearchParams();
  const { refreshEntitlements } = useEntitlements();
  const actions = useCoachStore((state) => state.actions);
  const { capture: track } = useAnalytics();
  const dashboardActions = useDashboardPreferences(selectDashboardActions);
  const widgetVisibility = useDashboardPreferences(selectWidgetVisibility);
  const [showWidgetPanel, setShowWidgetPanel] = useState(false);

  const hiddenCount = Object.values(widgetVisibility).filter((v) => !v).length;

  useEffect(() => {
    const handlePurchaseSuccess = async () => {
      const personaParam = searchParams.get("persona");

      if (personaParam) {
        try {
          // Refresh entitlements to get the new purchase
          await refreshEntitlements();

          // Select the purchased persona
          actions.selectPersona(personaParam);

          // Track the successful purchase
          track("purchase_completed", { personaId: personaParam });

          // Clean up the URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("persona");
          window.history.replaceState({}, "", newUrl.pathname + newUrl.search);

          // TODO: Show success toast
        } catch (error) {
          console.error("Purchase success handling error:", error);
          track("purchase_success_handling_error", {
            personaId: personaParam,
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }
    };

    handlePurchaseSuccess();
  }, [searchParams, refreshEntitlements, actions, track]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <DashboardPageHeader
          eyebrow="Today"
          title="Daily focus"
          description="Set your intention, track practice momentum, and jump into your coach workspace—all synced with Supabase telemetry."
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowWidgetPanel(!showWidgetPanel)}
          className="gap-2 mt-1"
        >
          <LayoutGrid className="size-4" />
          Customize
          {hiddenCount > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
              {hiddenCount} hidden
            </span>
          )}
        </Button>
      </div>

      {showWidgetPanel && (
        <div className="philosophy-card p-5 animate-fade-in-up border-2 border-persona/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-semibold text-lg">Widget Visibility</h3>
              <p className="text-sm text-muted-foreground">
                Toggle widgets on/off. Hover over any widget to hide it quickly.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => dashboardActions.resetToDefaults()}>
              Reset to defaults
            </Button>
          </div>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(widgetVisibility).map(([key, visible]) => (
              <button
                key={key}
                onClick={() => dashboardActions.toggleWidget(key as any)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all hover:border-persona ${
                  visible ? "bg-background border-border" : "bg-muted/30 border-muted"
                }`}
              >
                <div
                  className={`rounded-lg p-2 ${visible ? "bg-persona/10 text-persona" : "bg-muted text-muted-foreground"}`}
                >
                  {visible ? <Eye className="size-4" /> : <Eye className="size-4 opacity-40" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${visible ? "text-foreground" : "text-muted-foreground"}`}>
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())
                      .trim()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[2fr,1fr]">
        <div className="grid gap-4">
          <WidgetWrapper widgetKey="morningIntention">
            <MorningIntentionForm />
          </WidgetWrapper>
          <WidgetWrapper widgetKey="practiceQuickActions">
            <PracticeQuickActions />
          </WidgetWrapper>
          <WidgetWrapper widgetKey="todayOverview">
            <TodayOverview />
          </WidgetWrapper>
          <WidgetWrapper widgetKey="reflectionsStatus">
            <ReflectionsStatus />
          </WidgetWrapper>
        </div>
        <div className="grid gap-4">
          <WidgetWrapper widgetKey="returnScoreTiles">
            <ReturnScoreTiles />
          </WidgetWrapper>
          <WidgetWrapper widgetKey="dailyQuote">
            <DailyQuote />
          </WidgetWrapper>
          <WidgetWrapper widgetKey="dailyInsight">
            <DailyInsight />
          </WidgetWrapper>
          <WidgetWrapper widgetKey="coachPreview">
            <CoachPreview />
          </WidgetWrapper>
        </div>
      </div>
      <div className="philosophy-divider">
        <span className="philosophy-divider-ornament text-xl">✦</span>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr,1fr]">
        <WidgetWrapper widgetKey="personaSuggestedPractice">
          <PersonaSuggestedPractice />
        </WidgetWrapper>
        <WidgetWrapper widgetKey="practicesOverview">
          <PracticesOverview />
        </WidgetWrapper>
      </div>
    </div>
  );
}