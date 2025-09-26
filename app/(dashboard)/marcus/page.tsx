import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CoachPreview } from "@/components/marcus/coach-preview";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Coaches",
  description:
    "Explore streaming conversations with Pocket Philosopher personas and prepare instrumentation for AI orchestration.",
  path: "/marcus",
});

export default function MarcusPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Coaches</h1>
        <p className="text-sm text-muted-foreground">
          Persistent conversations with Pocket Philosopher personas. Streaming UI, retrieval, and
          citation pathways will slot into this scaffold once the AI orchestration layer is online.
        </p>
      </div>
      <CoachPreview />
      <section className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Instrumentation goals</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Emit AI latency, token, and provider metrics to the observability pipeline.</li>
          <li>Capture conversation context for persona switching and suggestions.</li>
          <li>Design fallback UX for provider outages and offline drafting.</li>
        </ul>
        <Button asChild variant="link" className="mt-4 gap-2 p-0 text-primary">
          <Link href="/docs/build-plan/ai-and-knowledge-system">Review AI build plan</Link>
        </Button>
      </section>
    </div>
  );
}
