import { ArrowRight, BookOpenCheck, LineChart, Sparkles } from "lucide-react";
import Link from "next/link";

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
    icon: Sparkles,
  },
  {
    title: "Pocket Philosopher Coaches",
    description:
      "Persona-based guidance powered by retrieval-augmented generation and your recent activity.",
    icon: BookOpenCheck,
  },
  {
    title: "Virtue Analytics",
    description:
      "Track streaks, virtue balance, and the Return Score over time with shame-free visualizations.",
    icon: LineChart,
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

        <div className="grid gap-6 md:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"
            >
              <Icon className="mb-4 size-10 text-primary" aria-hidden />
              <h2 className="mb-2 text-lg font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Current Workstreams
          </h3>
          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            {workstreams.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-lg bg-background/80 p-4 shadow-sm"
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

