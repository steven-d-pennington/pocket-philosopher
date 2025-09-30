"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Loader2, MessageCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CitationList } from "@/components/shared/citation-list";
import { StreamingIndicator } from "@/components/shared/streaming-indicator";
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
    <aside className="flex flex-col gap-4 rounded-3xl border border-border bg-card/80 p-4" role="complementary" aria-label="Philosophy coach selection">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Personas</p>
        <h2 className="text-lg font-semibold text-foreground">Choose your guide</h2>
      </header>
      <div className="space-y-2" role="radiogroup" aria-label="Select philosophy coach">
        {personas.map((persona) => {
          const isActive = persona.id === activePersona.id;
          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => actions.selectPersona(persona.id)}
              className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${
                isActive
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
              }`}
              role="radio"
              aria-checked={isActive}
              aria-label={`Select ${persona.name}, ${persona.title}. ${persona.description}`}
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
      <div className="rounded-2xl border border-dashed border-border/80 bg-background/70 p-4 text-xs text-muted-foreground" role="region" aria-label="Current coach information">
        <p className="font-semibold text-foreground">Persona expertise</p>
        <p className="mt-2">{activePersona.description}</p>
        <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Focus areas</p>
        <ul className="mt-1 flex flex-wrap gap-2" role="list" aria-label="Coach focus areas">
          {activePersona.expertise.map((topic) => (
            <li key={topic} className="rounded-full border border-border px-2 py-0.5 text-[11px]" role="listitem">
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
  const hasCitations = !isUser && Array.isArray(message.citations) && message.citations.length > 0;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`} role="article" aria-label={`${isUser ? "Your" : "Coach"} message`}>
      <div
        className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-primary/50 focus-within:ring-offset-2 ${
          isUser
            ? "bg-primary text-primary-foreground ml-12"
            : "bg-card/95 text-foreground border border-border/60 mr-12"
        }`}
        tabIndex={0}
      >
        {/* Message Actions - appear on hover/focus */}
        <div className={`absolute top-2 ${isUser ? "left-2" : "right-2"} opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity`}>
          <button
            type="button"
            className="rounded-full bg-background/80 p-1 text-xs text-muted-foreground hover:bg-background hover:text-foreground focus:bg-background focus:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            onClick={() => navigator.clipboard.writeText(message.content)}
            title="Copy message to clipboard"
            aria-label="Copy message content"
          >
            📋
          </button>
        </div>

        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

        {hasCitations ? (
          <div className="mt-3" role="region" aria-label="Sources and citations">
            <CitationList citations={message.citations!} />
          </div>
        ) : null}

        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <time
            dateTime={new Date(message.createdAt).toISOString()}
            aria-label={`Message sent at ${new Date(message.createdAt).toLocaleTimeString()}`}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </time>
          {message.streaming ? (
            <span className="inline-flex items-center gap-1 text-primary font-medium" aria-live="polite" aria-label="Coach is currently typing">
              <div className="size-1.5 animate-pulse rounded-full bg-primary" aria-hidden />
              live
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EmptyConversationState() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="max-w-md rounded-3xl border border-dashed border-border/70 bg-gradient-to-br from-muted/20 to-muted/10 p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-primary/10 p-3">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          Begin Your Philosophical Journey
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Share your thoughts, challenges, or questions. Your AI coach will provide thoughtful guidance
          inspired by the wisdom of great philosophers.
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted px-3 py-1">• Ask about ethics</span>
          <span className="rounded-full bg-muted px-3 py-1">• Seek wisdom</span>
          <span className="rounded-full bg-muted px-3 py-1">• Reflect on life</span>
        </div>
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
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-1">
      {messages.length === 0 ? (
        <EmptyConversationState />
      ) : (
        <div className="space-y-6">
          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}

function MessageComposer({ onSend, disabled }: { onSend: (value: string) => void; disabled: boolean }) {
  const [mode, setMode] = useState<"input" | "textarea">("textarea");
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!value.trim()) return;
    onSend(value);
    setValue("");

    // Focus back to input after sending
    setTimeout(() => {
      if (mode === "textarea" && textareaRef.current) {
        textareaRef.current.focus();
      } else if (mode === "input" && inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={handleSubmit}
      role="form"
      aria-label="Send message to coach"
    >
      {mode === "input" ? (
        <Input
          ref={inputRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask a question or share a reflection…"
          disabled={disabled}
          aria-label="Type your message"
          autoComplete="off"
        />
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask a question or share a reflection…"
          disabled={disabled}
          className="min-h-[120px]"
          aria-label="Type your message (multi-line)"
          autoComplete="off"
        />
      )}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <button
          type="button"
          onClick={() => setMode((prev) => (prev === "input" ? "textarea" : "input"))}
          className="text-xs font-medium text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded px-1 py-0.5"
          aria-label={`Switch to ${mode === "input" ? "multi-line" : "single-line"} input mode`}
        >
          Toggle {mode === "input" ? "multi-line" : "single-line"}
        </button>
        <Button
          type="submit"
          size="sm"
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
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
    <section className="flex min-h-[70vh] flex-col gap-4 rounded-3xl border border-border bg-card/70 p-4" role="main" aria-label="Philosophy coaching conversation">
      <ConversationHeader persona={persona} />
      <ConversationMessages messages={messages} isStreaming={conversation.isStreaming} />
      <footer className="space-y-3" role="contentinfo">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <StreamingIndicator isStreaming={conversation.isStreaming} tokens={conversation.tokens} />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => {
              resetConversation();
              track("coach_conversation_reset", { personaId: persona.id });
            }}
            aria-label="Reset conversation thread"
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
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]" role="application" aria-label="Philosophy coach workspace">
      <PersonaSidebar />
      <ConversationPane />
    </div>
  );
}

