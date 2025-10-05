"use client";

import { useEffect, useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePracticeMutation } from "@/lib/hooks/use-practices";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { usePracticeModalStore } from "@/lib/stores/practice-modal-store";

import {
  dayOptions,
  practiceFormSchema,
  type PracticeFormValues,
  virtueOptions,
} from "./practice-form-constants";

export function CreatePracticeModal() {
  const mode = usePracticeModalStore((state) => state.mode);
  const draft = usePracticeModalStore((state) => state.draft);
  const { close } = usePracticeModalStore((state) => state.actions);
  const mutation = useCreatePracticeMutation();
  const { capture: track } = useAnalytics();

  const defaultValues = useMemo<PracticeFormValues>(() => ({
    name: draft?.name ?? "",
    description: draft?.description ? draft.description : "",
    virtue: draft?.virtue ?? virtueOptions[0],
    frequency: draft?.frequency ?? "daily",
    difficulty: draft?.difficulty ?? "medium",
    reminderTime: draft?.reminderTime ?? "",
    tags: Array.isArray(draft?.tags) ? draft?.tags?.join(", ") ?? "" : "",
    activeDays:
      draft?.activeDays && draft.activeDays.length > 0
        ? [...draft.activeDays]
        : [1, 2, 3, 4, 5, 6, 7],
  }), [draft]);

  const form = useForm<PracticeFormValues>({
    resolver: zodResolver(practiceFormSchema),
    defaultValues,
  });

  const { watch, setValue, reset, formState, handleSubmit, register } = form;
  const activeDays = watch("activeDays") ?? [1, 2, 3, 4, 5, 6, 7];

  const open = mode === "create";

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const toggleDay = (day: number) => {
    const currentDays = activeDays ?? [1, 2, 3, 4, 5, 6, 7];
    if (currentDays.includes(day)) {
      setValue(
        "activeDays",
        currentDays.filter((value) => value !== day),
      );
    } else {
      setValue(
        "activeDays",
        [...currentDays, day].sort((a, b) => a - b),
      );
    }
  };

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(
      {
        name: values.name,
        description: values.description?.trim() || null,
        virtue: values.virtue,
        frequency: values.frequency,
        difficulty: values.difficulty && values.difficulty.length > 0 ? values.difficulty : undefined,
        reminderTime: values.reminderTime ? values.reminderTime : undefined,
        trackingType: "boolean",
        targetValue: null,
        tags:
          values.tags && values.tags.trim().length > 0
            ? values.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
            : undefined,
        activeDays: values.activeDays,
      },
      {
        onSuccess: (practice) => {
          toast.success("Practice created");
          track("practice_created", {
            practiceId: practice.id,
            virtue: practice.virtue,
            frequency: practice.frequency,
          });
          close();
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to create practice");
          track("practice_create_failed", {
            message: error instanceof Error ? error.message : String(error),
          });
        },
      },
    );
  });

  return (
    <Modal
      open={open}
      onClose={() => close()}
      title="New practice"
      description="Define a virtue-aligned routine and optional reminders."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="practice-name">Name</Label>
          <Input id="practice-name" placeholder="Evening reflection" {...register("name")} />
          {formState.errors.name ? (
            <p className="text-xs text-destructive">{formState.errors.name.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="practice-description">Description</Label>
          <Textarea
            id="practice-description"
            placeholder="Capture a short summary of the practice."
            {...register("description")}
          />
          {formState.errors.description ? (
            <p className="text-xs text-destructive">{formState.errors.description.message}</p>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="practice-virtue">Virtue focus</Label>
            <select
              id="practice-virtue"
              className="w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              {...register("virtue")}
            >
              {virtueOptions.map((virtue) => (
                <option key={virtue} value={virtue}>
                  {virtue}
                </option>
              ))}
            </select>
            {formState.errors.virtue ? (
              <p className="text-xs text-destructive">{formState.errors.virtue.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="practice-frequency">Frequency</Label>
            <select
              id="practice-frequency"
              className="w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              {...register("frequency")}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom cadence</option>
            </select>
            {formState.errors.frequency ? (
              <p className="text-xs text-destructive">{formState.errors.frequency.message}</p>
            ) : null}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="practice-difficulty">Difficulty</Label>
            <select
              id="practice-difficulty"
              className="w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              {...register("difficulty")}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="practice-reminder">Reminder time</Label>
            <Input id="practice-reminder" type="time" {...register("reminderTime")}
 />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Active days</Label>
          <div className="flex flex-wrap gap-2">
            {dayOptions.map((day) => {
              const selected = activeDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${selected ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/60"}`}
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
          {formState.errors.activeDays ? (
            <p className="text-xs text-destructive">{formState.errors.activeDays.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="practice-tags">Tags</Label>
          <Input
            id="practice-tags"
            placeholder="Evening, Stoic, Reflection"
            {...register("tags")}
          />
          <p className="text-xs text-muted-foreground">
            Separate tags with commas to help future filtering.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={() => close()} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating…" : "Create practice"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
