"use client";

import { useEffect, useMemo, useState } from "react";

import { Sparkles, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useSaveReflectionMutation,
  type Reflection,
  type ReflectionType,
} from "@/lib/hooks/use-reflections";
import { getPersonaProfile, DEFAULT_PERSONA_ID } from "@/lib/ai/personas";
import { useAuthStore, selectAuthProfile } from "@/lib/stores/auth-store";

interface ReflectionComposerProps {
  selectedType: ReflectionType;
  onTypeChange: (type: ReflectionType) => void;
  reflectionsByType: Record<ReflectionType, Reflection | undefined>;
  targetDate: string;
  isFetching?: boolean;
}

interface ReflectionFormValues {
  virtueFocus: string;
  intention: string;
  gratitude: string;
  challenge: string;
  lesson: string;
  journalEntry: string;
  keyInsights: string;
  winsCelebrated: string;
  mood: number;
}

const reflectionPrompts: Record<ReflectionType, { title: string; cue: string }> = {
  morning: {
    title: "Morning centering",
    cue: "Ground the day in intention and clarity.",
  },
  midday: {
    title: "Midday adjustment",
    cue: "Take stock of choices and course-correct.",
  },
  evening: {
    title: "Evening integration",
    cue: "Gather lessons, celebrate wins, and release friction.",
  },
};

const virtues = ["Wisdom", "Justice", "Temperance", "Courage", "Compassion", "Resilience"];

function parseList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ReflectionComposer({
  selectedType,
  onTypeChange,
  reflectionsByType,
  targetDate,
  isFetching,
}: ReflectionComposerProps) {
  const profile = useAuthStore(selectAuthProfile);
  const defaultPersonaId = profile?.preferred_persona ?? DEFAULT_PERSONA_ID;
  const [personaId, setPersonaId] = useState(defaultPersonaId);
  const persona = useMemo(() => getPersonaProfile(personaId), [personaId]);

  const saveReflection = useSaveReflectionMutation(targetDate);

  const form = useForm<ReflectionFormValues>({
    defaultValues: {
      virtueFocus: profile?.preferred_virtue ?? "Wisdom",
      intention: "",
      gratitude: "",
      challenge: "",
      lesson: "",
      journalEntry: "",
      keyInsights: "",
      winsCelebrated: "",
      mood: 5,
    },
  });

  const existingReflection = reflectionsByType[selectedType];

  useEffect(() => {
    if (!existingReflection) {
      form.reset({
        virtueFocus: profile?.preferred_virtue ?? "Wisdom",
        intention: "",
        gratitude: "",
        challenge: "",
        lesson: "",
        journalEntry: "",
        keyInsights: "",
        winsCelebrated: "",
        mood: 5,
      });
      return;
    }

    form.reset({
      virtueFocus: existingReflection.virtueFocus ?? profile?.preferred_virtue ?? "Wisdom",
      intention: existingReflection.intention ?? "",
      gratitude: existingReflection.gratitude ?? "",
      challenge: existingReflection.challenge ?? "",
      lesson: existingReflection.lesson ?? "",
      journalEntry: existingReflection.journalEntry ?? "",
      keyInsights: (existingReflection.keyInsights ?? []).join("\n"),
      winsCelebrated: (existingReflection.winsCelebrated ?? []).join("\n"),
      mood: existingReflection.mood ?? 5,
    });
  }, [existingReflection, form, profile?.preferred_virtue]);

  useEffect(() => {
    setPersonaId(defaultPersonaId);
  }, [defaultPersonaId, selectedType]);

  const moodValue = form.watch("mood");

  const onSubmit = form.handleSubmit((values) => {
    saveReflection.mutate(
      {
        type: selectedType,
        virtueFocus: values.virtueFocus,
        intention: values.intention,
        gratitude: values.gratitude,
        challenge: values.challenge,
        lesson: values.lesson,
        journalEntry: values.journalEntry,
        mood: values.mood,
        keyInsights: parseList(values.keyInsights),
        winsCelebrated: parseList(values.winsCelebrated),
      },
      {
        onSuccess: () => {
          toast.success("Reflection saved");
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Unable to save reflection");
        },
      },
    );
  });

  return (
    <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Guided journaling</p>
          <h2 className="text-2xl font-semibold">{reflectionPrompts[selectedType].title}</h2>
          <p className="text-sm text-muted-foreground">
            {reflectionPrompts[selectedType].cue} Capture detail now; analytics will synthesize your {"Return Score"}
            insights overnight.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-2xl border border-border/60 bg-muted/30 p-1 text-xs uppercase tracking-[0.18em]">
            {(Object.keys(reflectionPrompts) as ReflectionType[]).map((type) => (
              <button
                key={type}
                type="button"
                className={`rounded-2xl px-3 py-1 font-medium transition ${
                  type === selectedType ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
                onClick={() => onTypeChange(type)}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/30 px-3 py-1 text-sm">
            <UserCircle2 className="size-5 text-muted-foreground" aria-hidden />
            <select
              className="bg-transparent text-sm font-medium capitalize focus:outline-none"
              value={personaId}
              onChange={(event) => setPersonaId(event.target.value)}
            >
              {(["marcus", "lao", "simone", "epictetus"] as const).map((id) => {
                const p = getPersonaProfile(id);
                return (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="virtue">Virtue focus</Label>
              <select
                id="virtue"
                className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm"
                {...form.register("virtueFocus")}
              >
                {virtues.map((virtue) => (
                  <option key={virtue} value={virtue}>
                    {virtue}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mood">Mood ({moodValue}/10)</Label>
              <input
                id="mood"
                type="range"
                min={0}
                max={10}
                step={1}
                className="w-full accent-primary"
                {...form.register("mood", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="intention">Intention</Label>
              <Input id="intention" placeholder="What will you return to today?" {...form.register("intention")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gratitude">Gratitude</Label>
              <Input id="gratitude" placeholder="Name someone or something to appreciate" {...form.register("gratitude")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="challenge">Challenge</Label>
              <Textarea
                id="challenge"
                rows={3}
                placeholder="What friction or resistance appeared?"
                {...form.register("challenge")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson">Lesson</Label>
              <Textarea
                id="lesson"
                rows={3}
                placeholder="What did you learn about yourself or others?"
                {...form.register("lesson")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="journalEntry">Journal entry</Label>
            <Textarea
              id="journalEntry"
              rows={6}
              placeholder="Free-write your stream of consciousness or insights."
              {...form.register("journalEntry")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="keyInsights">Key insights (one per line)</Label>
              <Textarea id="keyInsights" rows={3} {...form.register("keyInsights")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="winsCelebrated">Wins celebrated (one per line)</Label>
              <Textarea id="winsCelebrated" rows={3} {...form.register("winsCelebrated")} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Entries autosave via Supabase—reopen anytime to continue refining your narrative.
            </p>
            <Button type="submit" disabled={saveReflection.isPending || isFetching} className="gap-2">
              <Sparkles className="size-4" aria-hidden />
              {saveReflection.isPending ? "Saving…" : "Save reflection"}
            </Button>
          </div>
        </form>

        <aside className="space-y-4 rounded-3xl border border-border/60 bg-muted/20 p-5 text-sm">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Persona cue</p>
            <p className="text-lg font-semibold text-foreground">{persona.name}</p>
            <p className="text-sm text-muted-foreground">{persona.voice}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Signature prompts</p>
            <ul className="list-disc space-y-1 pl-5 text-foreground">
              {persona.signaturePractices.slice(0, 3).map((practice) => (
                <li key={practice}>{practice}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Focus</p>
            <p className="text-foreground">{persona.focus}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
