"use client";

import Link from "next/link";

import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePersonaTheme } from "@/lib/hooks/use-persona-theme";
import { selectActiveConversation, selectActivePersona, useCoachStore } from "@/lib/stores/coach-store";

export function CoachPreview() {
  const persona = useCoachStore(selectActivePersona);
  const conversation = useCoachStore(selectActiveConversation);
  const { theme } = usePersonaTheme();

  return (
    <section className="persona-card p-6 animate-fade-in-up shadow-philosophy">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-2xs uppercase tracking-[0.35em] text-muted-foreground font-medium">
            Pocket Coaches
          </p>
          <h2 className="text-2xl font-serif font-semibold flex items-center gap-2">
            <span className="persona-accent text-lg">{theme.decorative.divider}</span>
            Marcus and friends
          </h2>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-2 hover:bg-philosophy-scroll/50">
          <Link href="/marcus">
            Open coach
            <MessageCircle className="size-4" aria-hidden />
          </Link>
        </Button>
      </header>
      <div className="mt-5 rounded-xl border border-persona/40 bg-philosophy-scroll/30 p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground font-serif persona-accent">{theme.decorative.accentSymbol} Current persona</p>
        <p className="text-sm font-medium font-serif">{persona.name}</p>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{persona.description}</p>
        <div className="mt-4 rounded-xl border border-persona/60 bg-background/60 p-3 text-xs">
          <p className="font-semibold text-foreground">Latest exchange</p>
          {conversation.messages.length === 0 ? (
            <p className="text-muted-foreground">No messages yet. Open the workspace to start chatting.</p>
          ) : (
            <div className="mt-2 space-y-1 text-muted-foreground">
              {conversation.messages.slice(-2).map((message) => (
                <p key={message.id}>
                  <span className="font-medium text-foreground">{message.role === "user" ? "You" : persona.name}:</span>{" "}
                  {message.content.slice(0, 120)}{message.content.length > 120 ? "…" : ""}
                </p>
              ))}
              {conversation.isStreaming ? (
                <p className="flex items-center gap-2 text-primary">
                  <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden />
                  Streaming response…
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
