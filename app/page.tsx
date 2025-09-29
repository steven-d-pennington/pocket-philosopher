import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { FeatureGrid } from "@/components/home/feature-grid";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Welcome",
  description:
    "Explore the Pocket Philosopher rebuild overview, feature highlights, and direct links into the build plan roadmap.",
  path: "/",
});

const features = [
  {
    title: "Daily Practice Hub",
    description:
      "Intentions, practices, reflections, and Return Score insights in a single resilient loop.",
    icon: "sparkles" as const,
  },
  {
    title: "Pocket Philosopher Coaches",
    description:
      "Persona-based guidance powered by retrieval-augmented generation and your recent activity.",
    icon: "book" as const,
  },
  {
    title: "Virtue Analytics",
    description:
      "Track streaks, virtue balance, and the Return Score over time with shame-free visualizations.",
    icon: "chart" as const,
  },
];

const workstreams = [
  "Supabase schema, auth, and API contracts",
  "App Router shell with shared UI primitives",
  "AI orchestration layer with provider failover",
  "Offline-ready PWA capabilities and analytics instrumentation",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 pb-12 pt-20 sm:px-10">
        <header className="flex flex-col gap-4">
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Pocket Philosopher Rebuild
          </span>
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Build a daily philosophy coach that helps people stay grounded, curious, and courageous.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            This workspace hosts the new Pocket Philosopher stack. Start with the environment tasks,
            keep Supabase and AI layers in sync, and deliver a seamless App Router experience.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild className="gap-2">
              <Link href="/docs/build-plan/master-scope">
                Review master scope
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Link
              href="/docs/build-plan/project-foundations-and-environment"
              className="text-sm font-medium text-primary underline-offset-4 transition hover:underline"
            >
              View build plan details
            </Link>
          </div>
        </header>

        <FeatureGrid features={features} />

        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Current Workstreams
          </h3>
          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            {workstreams.map((item) => (
              <li
                key={item}
              className="flex items-start gap-3 rounded-lg bg-background/80 p-4 shadow-sm transition focus-within:ring-2 focus-within:ring-primary/50 focus-within:ring-offset-2 hover:-translate-y-0.5"
            >
              <span className="mt-1 inline-flex size-2 rounded-full bg-primary" aria-hidden />
              <span>{item}</span>
            </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

