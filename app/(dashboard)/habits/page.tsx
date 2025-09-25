import { HabitsOverview } from "@/components/habits/habits-overview";

export default function HabitsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Habits</h1>
        <p className="text-sm text-muted-foreground">
          Manage virtue-aligned routines, drag ordering, reminders, and archive policies. The
          overview below reflects Supabase data and prepares the stage for shadcn-driven lists and
          modals.
        </p>
      </div>
      <HabitsOverview />
      <section className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Next up</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Hook up TanStack Query mutations for create/update/archive flows.</li>
          <li>Render drag-and-drop ordering with virtualized list support.</li>
          <li>
            Integrate optimistic updates with <code>useHabitsStore</code> actions and Supabase
            response merging.
          </li>
        </ul>
      </section>
    </div>
  );
}
