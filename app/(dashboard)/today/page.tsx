import { CoachPreview } from "@/components/marcus/coach-preview";
import { HabitsOverview } from "@/components/habits/habits-overview";
import { ReflectionsStatus } from "@/components/reflections/reflections-status";
import { TodayOverview } from "@/components/dashboard/today-overview";

export default function TodayPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Today</h1>
        <p className="text-sm text-muted-foreground">
          Track intentions, complete habits, and keep reflections flowing. Data below streams from
          Supabase-backed queries—wire in the actual UI as endpoints mature.
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <TodayOverview />
        <HabitsOverview />
        <ReflectionsStatus />
        <CoachPreview />
      </div>
    </div>
  );
}
