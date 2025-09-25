import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Help & Feedback</h1>
        <p className="text-sm text-muted-foreground">
          Surface documentation, share feedback, and monitor build health. Hook this page to the
          /api/debug and /api/health routes as they evolve.
        </p>
      </div>
      <section className="grid gap-4 rounded-3xl border border-border p-6 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Quick links</p>
        <ul className="grid gap-2 md:grid-cols-2">
          <li>
            <Link href="/docs/build-plan/master-scope" className="underline underline-offset-4">
              Master scope document
            </Link>
          </li>
          <li>
            <Link
              href="/docs/build-plan/project-foundations-and-environment"
              className="underline underline-offset-4"
            >
              Foundations build plan
            </Link>
          </li>
          <li>
            <Link
              href="/docs/build-plan/data-and-backend-infrastructure"
              className="underline underline-offset-4"
            >
              Backend roadmap
            </Link>
          </li>
          <li>
            <Link
              href="/docs/build-plan/testing-and-quality-assurance"
              className="underline underline-offset-4"
            >
              Testing & QA milestones
            </Link>
          </li>
        </ul>
      </section>
      <section className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">In progress</p>
        <p>
          Feedback submission and diagnostics reporting will connect to Supabase tables (eedback,
          pp_settings) once the backend endpoints are finalized.
        </p>
      </section>
    </div>
  );
}
