import { ReflectionsStatus } from "@/components/reflections/reflections-status";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Reflections",
  description:
    "Draft morning, midday, and evening reflections with persona-guided prompts and analytics-aware journaling.",
  path: "/reflections",
});

export default function ReflectionsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Reflections</h1>
        <p className="text-sm text-muted-foreground">
          Guided journaling across morning, midday, and evening anchors. This scaffold will host the
          prompt wizard, mood sliders, and archives described in the build plan.
        </p>
      </div>
      <ReflectionsStatus />
      <section className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Open questions</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Decide on local draft persistence strategy for offline usage.</li>
          <li>Finalize tone/voice for reflection prompts per persona and virtue.</li>
          <li>Wire Supabase updates to trigger analytics recalculations.</li>
        </ul>
      </section>
    </div>
  );
}
