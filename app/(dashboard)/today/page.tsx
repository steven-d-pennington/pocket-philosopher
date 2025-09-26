import { CoachPreview } from "@/components/marcus/coach-preview";
import { PracticeQuickActions } from "@/components/practices/practice-quick-actions";
import { MorningIntentionForm } from "@/components/dashboard/morning-intention-form";
import { PracticesOverview } from "@/components/practices/practices-overview";
import { ReflectionsStatus } from "@/components/reflections/reflections-status";
import { TodayOverview } from "@/components/dashboard/today-overview";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Today",
  description:
    "Check in on your intention, log practices, review Return Score tiles, and jump into coach conversations for the day.",
  path: "/today",
});

export default function TodayPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Today</h1>
        <p className="text-sm text-muted-foreground">
          Track intentions, complete practices, and keep reflections flowing. Data below streams from
          Supabase-backed queries—wire in the actual UI as endpoints mature.
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <MorningIntentionForm />
        <PracticeQuickActions />
        <TodayOverview />
        <PracticesOverview />
        <ReflectionsStatus />
        <CoachPreview />
      </div>
    </div>
  );
}
