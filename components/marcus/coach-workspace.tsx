"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { useCoachConversation } from "@/lib/hooks/use-coach-conversation";
import {
  selectActivePersona,
  useCoachStore,
  type CoachMessage,
  type CoachPersona,
} from "@/lib/stores/coach-store";

function PersonaBadge({ persona }: { persona: CoachPersona }) {
  return (
    <span className={`inline-flex h-5 w-5 rounded-full ${persona.accentColor}`} aria-hidden />
  );
}

function PersonaSidebar() {
  const personas = useCoachStore((state) => state.personas);
  const activePersona = useCoachStore(selectActivePersona);
  const actions = useCoachStore((state) => state.actions);

  return (
    <aside className="flex flex-col gap-4 rounded-3xl border border-border bg-card/80 p-4">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Personas</p>
        <h2 className="text-lg font-semibold text-foreground">Choose your guide</h2>
      </header>
      <div className="space-y-2">
        {personas.map((persona) => {
          const isActive = persona.id === activePersona.id;
          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => actions.selectPersona(persona.id)}
              className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${
                isActive
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
              }`}
            >
              <PersonaBadge persona={persona} />
              <span>
                <span className="block text-sm font-semibold text-foreground">{persona.name}</span>
                <span className="block text-xs text-muted-foreground">{persona.title}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="rounded-2xl border border-dashed border-border/80 bg-background/70 p-4 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">Persona expertise</p>
        <p className="mt-2">{activePersona.description}</p>
        <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Focus areas</p>
        <ul className="mt-1 flex flex-wrap gap-2">
          {activePersona.expertise.map((topic) => (
            <li key={topic} className="rounded-full border border-border px-2 py-0.5 text-[11px]">
              {topic}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function ConversationHeader({ persona }: { persona: CoachPersona }) {
  return (
    <header className="flex flex-col gap-1 rounded-3xl border border-border bg-card/80 p-4">
      <div className="flex items-center gap-3">
        <PersonaBadge persona={persona} />
        <div>
          <h2 className="text-lg font-semibold text-foreground">{persona.name}</h2>
          <p className="text-sm text-muted-foreground">{persona.title}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{persona.description}</p>
    </header>
  );
}

function MessageBubble({ message }: { message: CoachMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm transition ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card/90 text-foreground border border-border"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <span className="mt-2 block text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {message.streaming ? " · streaming" : ""}
        </span>
      </div>
    </div>
  );
}

function ConversationMessages({ messages, isStreaming }: { messages: CoachMessage[]; isStreaming: boolean }) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isStreaming]);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-1">
      {messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          Send your first message to invite thoughtful coaching guidance.
        </div>
      ) : (
        messages.map((message) => <MessageBubble key={message.id} message={message} />)
      )}
      <div ref={endRef} />
    </div>
  );
}

function MessageComposer({ onSend, disabled }: { onSend: (value: string) => void; disabled: boolean }) {
  const [mode, setMode] = useState<"input" | "textarea">("textarea");
  const [value, setValue] = useState("");

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!value.trim()) return;
        onSend(value);
        setValue("");
      }}
    >
      {mode === "input" ? (
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask a question or share a reflection…"
          disabled={disabled}
        />
      ) : (
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask a question or share a reflection…"
          disabled={disabled}
          className="min-h-[120px]"
        />
      )}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <button
          type="button"
          onClick={() => setMode((prev) => (prev === "input" ? "textarea" : "input"))}
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Toggle {mode === "input" ? "multi-line" : "single-line"}
        </button>
        <Button type="submit" size="sm" disabled={disabled || !value.trim()}>
          Send
        </Button>
      </div>
    </form>
  );
}

function ConversationPane() {
  const { persona, conversation, sendMessage, resetConversation } = useCoachConversation();
  const { capture: track } = useAnalytics();

  const messages = useMemo(() => conversation.messages, [conversation.messages]);

  return (
    <section className="flex min-h-[70vh] flex-col gap-4 rounded-3xl border border-border bg-card/70 p-4">
      <ConversationHeader persona={persona} />
      <ConversationMessages messages={messages} isStreaming={conversation.isStreaming} />
      <footer className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {conversation.isStreaming ? (
              <span className="inline-flex items-center gap-2 text-primary">
                <Loader2 className="size-3 animate-spin" aria-hidden />
                Streaming response…
              </span>
            ) : (
              <span>Tokens streamed: {conversation.tokens}</span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => {
              resetConversation();
              track("coach_conversation_reset", { personaId: persona.id });
            }}
          >
            <RefreshCw className="size-3" aria-hidden />
            Reset thread
          </Button>
        </div>
        <MessageComposer
          onSend={(value) => {
            sendMessage(value);
            track("coach_message_sent", { personaId: persona.id });
          }}
          disabled={conversation.isStreaming}
        />
      </footer>
    </section>
  );
}

export function CoachWorkspace() {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <PersonaSidebar />
      <ConversationPane />
    </div>
  );
}

