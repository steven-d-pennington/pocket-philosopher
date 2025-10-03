import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { FeatureGrid } from "@/components/home/feature-grid";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Pocket Philosopher - Daily Philosophy Practice with AI Guidance",
  description:
    "Build daily philosophy habits with intention-setting, virtue practices, reflective journaling, and an AI coach. Stay grounded, curious, and courageous every day.",
  path: "/",
});

const features = [
  {
    title: "Daily Practice Hub",
    description:
      "Set intentions, complete virtue practices, journal reflections, and track your growth in one seamless daily loop.",
    icon: "sparkles" as const,
  },
  {
    title: "AI Philosophy Coach",
    description:
      "Choose from multiple philosophical personas including Marcus Aurelius, Socrates, and others. Get personalized guidance powered by your activity and wisdom.",
    icon: "book" as const,
  },
  {
    title: "Virtue Analytics",
    description:
      "Monitor your progress with streak tracking, virtue balance insights, and shame-free visualizations of your journey.",
    icon: "chart" as const,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 pb-12 pt-20 sm:px-10">
        <header className="flex flex-col gap-6 text-center">
          <div className="mx-auto flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="size-4" />
            Daily Philosophy Practice Made Simple
          </div>
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Build Daily Philosophy Habits with AI Guidance
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg lg:text-xl">
            Set intentions, practice virtues, reflect on your day, and get personalized coaching from
            Marcus Aurelius. Stay grounded, curious, and courageous through consistent philosophical practice.
          </p>
          <div className="mx-auto flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="gap-2 text-base">
              <Link href="/signup">
                Start Your Philosophy Journey
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Free to start • No credit card required
            </p>
          </div>
        </header>

        <FeatureGrid features={features} />

        {/* Social Proof / Value Proposition */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-2xl border border-border bg-card/50 p-8 shadow-sm">
            <blockquote className="text-lg font-medium italic text-foreground">
              &ldquo;Philosophy is not just about reading books, but about living wisely. Pocket Philosopher
              helps you practice this every day.&rdquo;
            </blockquote>
            <cite className="mt-4 block text-sm text-muted-foreground">
              — Inspired by Marcus Aurelius, Meditations
            </cite>
          </div>
        </div>
      </section>

      {/* Footer with Developer Links */}
      <footer className="border-t border-border bg-muted/20">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8 sm:px-10">
          <p className="text-sm text-muted-foreground">
            Built with Next.js, Supabase, and AI orchestration
          </p>
          <Link
            href="/docs/build-plan/master-scope"
            className="text-sm font-medium text-primary underline-offset-4 transition hover:underline"
          >
            View Build Plan
          </Link>
        </div>
      </footer>
    </main>
  );
}

