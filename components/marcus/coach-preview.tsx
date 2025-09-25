"use client";

import Link from "next/link";

import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { selectStreamingState, useStreamingStore } from "@/lib/stores/streaming-store";

export function CoachPreview() {
  const streaming = useStreamingStore(selectStreamingState);

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
            Pocket Coaches
          </p>
          <h2 className="text-2xl font-semibold">Marcus and friends</h2>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/marcus">
            Open coach
            <MessageCircle className="size-4" aria-hidden />
          </Link>
        </Button>
      </header>
      <div className="mt-6 rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
        {streaming.status === "streaming" ? (
          <p>
            Streaming response in progress… tokens received: <strong>{streaming.tokens}</strong>
          </p>
        ) : (
          <p>
            Coach responses, prompts, and persona switching will render here once the AI
            orchestration layer is wired up. Use the link above to explore the chat workspace
            scaffold.
          </p>
        )}
      </div>
    </section>
  );
}
