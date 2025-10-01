"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DailyQuote } from "@/components/dashboard/daily-quote";
import { MorningIntentionForm } from "@/components/dashboard/morning-intention-form";
import { ReturnScoreTiles } from "@/components/dashboard/return-score-tiles";
import { TodayOverview } from "@/components/dashboard/today-overview";
import { CoachPreview } from "@/components/marcus/coach-preview";
import { PracticeQuickActions } from "@/components/practices/practice-quick-actions";
import { PracticesOverview } from "@/components/practices/practices-overview";
import { ReflectionsStatus } from "@/components/reflections/reflections-status";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { useEntitlements } from "@/lib/hooks/use-entitlements";
import { useCoachStore } from "@/lib/stores/coach-store";

export function TodayPageClient() {
  const searchParams = useSearchParams();
  const { refreshEntitlements } = useEntitlements();
  const actions = useCoachStore((state) => state.actions);
  const { capture: track } = useAnalytics();

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
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Today"
        title="Daily focus"
        description="Set your intention, track practice momentum, and jump into your coach workspace—all synced with Supabase telemetry."
      />
      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="grid gap-6">
          <MorningIntentionForm />
          <PracticeQuickActions />
          <TodayOverview />
          <ReflectionsStatus />
        </div>
        <div className="grid gap-6">
          <ReturnScoreTiles />
          <DailyQuote />
          <CoachPreview />
        </div>
      </div>
      <PracticesOverview />
    </div>
  );
}