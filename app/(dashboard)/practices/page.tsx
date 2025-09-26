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
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Practices</h1>
        <p className="text-sm text-muted-foreground">
          Manage virtue-aligned practices, cadence, reminders, and archive policies. The overview
          below reflects Supabase data and prepares the stage for shadcn-driven lists and modals.
        </p>
      </div>
      <PracticesOverview />
      <section className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Next up</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Hook up TanStack Query mutations for create/update/archive flows.</li>
          <li>Render drag-and-drop ordering with virtualized list support.</li>
          <li>
            Integrate optimistic updates with <code>usePracticesStore</code> actions and Supabase
            response merging.
          </li>
        </ul>
      </section>
    </div>
  );
}
