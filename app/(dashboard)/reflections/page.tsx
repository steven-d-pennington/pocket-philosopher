import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { ReflectionsStatus } from "@/components/reflections/reflections-status";
import { ReflectionsWorkspace } from "@/components/reflections/reflections-workspace";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Reflections",
  description:
    "Draft morning, midday, and evening reflections with persona-guided prompts and analytics-aware journaling.",
  path: "/reflections",
});

export default function ReflectionsPage() {
  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Reflections"
        title="Guided journaling"
        description="Move through morning, midday, and evening anchors with persona cues, mood tracking, and a rolling timeline of insights."
      />
      <ReflectionsStatus />
      <ReflectionsWorkspace />
    </div>
  );
}
