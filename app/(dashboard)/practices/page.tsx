import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PracticeList } from "@/components/practices/practice-list";
import { PracticesOverview } from "@/components/practices/practices-overview";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Practices",
  description:
    "Organize daily practices, tune cadence and reminders, and prepare Supabase-backed CRUD flows for upcoming releases.",
  path: "/practices",
});

export default function PracticesPage() {
  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Practices"
        title="Design your daily cadence"
        description="Create, schedule, reorder, and archive habits with Supabase-powered persistence. Drag to reorder active practices and open modals for deeper edits."
      />
      <PracticesOverview />
      <PracticeList />
    </div>
  );
}
