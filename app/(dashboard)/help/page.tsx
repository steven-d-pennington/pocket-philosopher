import Link from "next/link";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Help & Feedback",
  description:
    "Access documentation, debug tooling, and product feedback loops to support the Pocket Philosopher build.",
  path: "/help",
});

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Support"
        title="Help & feedback"
        description="Access build documentation, share product feedback, and review diagnostics for the Pocket Philosopher workspace."
      />
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
      <section className="grid gap-4 rounded-3xl border border-border/60 bg-muted/10 p-6 text-sm text-muted-foreground md:grid-cols-2">
        <div className="space-y-2">
          <p className="font-semibold text-foreground">Diagnostics</p>
          <p>
            Run <code className="rounded bg-muted px-2 py-1">/api/health</code> and <code className="rounded bg-muted px-2 py-1">/api/debug</code> to inspect service status once backend endpoints land.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-foreground">Feedback</p>
          <p>
            Feedback submission and diagnostics reporting will connect to Supabase tables (<code className="rounded bg-muted px-1 py-0.5">feedback</code>, <code className="rounded bg-muted px-1 py-0.5">app_settings</code>) as part of the upcoming infrastructure milestone.
          </p>
        </div>
      </section>
    </div>
  );
}
