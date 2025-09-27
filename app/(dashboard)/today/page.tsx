import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DailyQuote } from "@/components/dashboard/daily-quote";
import { MorningIntentionForm } from "@/components/dashboard/morning-intention-form";
import { ReturnScoreTiles } from "@/components/dashboard/return-score-tiles";
import { TodayOverview } from "@/components/dashboard/today-overview";
import { CoachPreview } from "@/components/marcus/coach-preview";
import { PracticeQuickActions } from "@/components/practices/practice-quick-actions";
import { PracticesOverview } from "@/components/practices/practices-overview";
import { ReflectionsStatus } from "@/components/reflections/reflections-status";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Today",
  description:
    "Check in on your intention, log practices, review Return Score tiles, and jump into coach conversations for the day.",
  path: "/today",
});

export default function TodayPage() {
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
