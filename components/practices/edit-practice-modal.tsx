"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { useUpdatePracticeMutation } from "@/lib/hooks/use-practices";
import {
  selectPracticeModalActions,
  usePracticeModalStore,
} from "@/lib/stores/practice-modal-store";
import type { Practice } from "@/lib/stores/practices-store";

import {
  dayOptions,
  practiceFormSchema,
  type PracticeFormValues,
  virtueOptions,
} from "./practice-form-constants";

const toFormValues = (practice: Practice): PracticeFormValues => ({
  name: practice.name,
  description: practice.description ?? "",
  virtue: practice.virtue,
  frequency: practice.frequency,
  difficulty: practice.difficulty ?? "medium",
  reminderTime: practice.reminderTime ?? "",
  tags: "",
  activeDays: practice.activeDays && practice.activeDays.length > 0 ? practice.activeDays : [
    1, 2, 3, 4, 5, 6, 7,
  ],
});

export function EditPracticeModal() {
  const mode = usePracticeModalStore((state) => state.mode);
  const practice = usePracticeModalStore((state) => state.practice);
  const { close } = usePracticeModalStore(selectPracticeModalActions);
  const mutation = useUpdatePracticeMutation();
  const { capture: track } = useAnalytics();

  const form = useForm<PracticeFormValues>({
    resolver: zodResolver(practiceFormSchema),
    defaultValues: practice ? toFormValues(practice) : undefined,
  });

  const { watch, setValue, reset, formState, handleSubmit, register } = form;
  const activeDays = watch("activeDays");

  const open = mode === "edit" && Boolean(practice);

  useEffect(() => {
    if (open && practice) {
      reset(toFormValues(practice));
    }
  }, [open, practice, reset]);

  useEffect(() => {
    if (!open) {
      reset(practice ? toFormValues(practice) : undefined);
    }
  }, [open, practice, reset]);

  const toggleDay = (day: number) => {
    if (activeDays.includes(day)) {
      setValue(
        "activeDays",
        activeDays.filter((value) => value !== day),
      );
    } else {
      setValue(
        "activeDays",
        [...activeDays, day].sort((a, b) => a - b),
      );
    }
  };

  const onSubmit = handleSubmit((values) => {
    if (!practice) return;

    mutation.mutate(
      {
        id: practice.id,
        name: values.name,
        description: values.description?.trim() || null,
        virtue: values.virtue,
        frequency: values.frequency,
        difficulty: values.difficulty && values.difficulty.length > 0 ? values.difficulty : null,
        reminderTime: values.reminderTime ? values.reminderTime : null,
        activeDays: values.activeDays,
      },
      {
        onSuccess: (updated) => {
          toast.success("Practice updated");
          track("practice_updated", {
            practiceId: updated.id,
            virtue: updated.virtue,
            frequency: updated.frequency,
          });
          close();
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to update practice");
          track("practice_update_failed", {
            practiceId: practice.id,
            message: error instanceof Error ? error.message : String(error),
          });
        },
      },
    );
  });

  if (!open || !practice) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={() => close()}
      title="Edit practice"
      description="Adjust cadence, reminders, or virtue alignment."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="practice-edit-name">Name</Label>
          <Input id="practice-edit-name" placeholder="Evening reflection" {...register("name")} />
          {formState.errors.name ? (
            <p className="text-xs text-destructive">{formState.errors.name.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="practice-edit-description">Description</Label>
          <Textarea
            id="practice-edit-description"
            placeholder="Capture a short summary of the practice."
            {...register("description")}
          />
          {formState.errors.description ? (
            <p className="text-xs text-destructive">{formState.errors.description.message}</p>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="practice-edit-virtue">Virtue focus</Label>
            <select
              id="practice-edit-virtue"
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
            <Label htmlFor="practice-edit-frequency">Frequency</Label>
            <select
              id="practice-edit-frequency"
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
            <Label htmlFor="practice-edit-difficulty">Difficulty</Label>
            <select
              id="practice-edit-difficulty"
              className="w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              {...register("difficulty")}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="practice-edit-reminder">Reminder time</Label>
            <Input id="practice-edit-reminder" type="time" {...register("reminderTime")}
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
          <Label htmlFor="practice-edit-tags">Tags</Label>
          <Input id="practice-edit-tags" placeholder="Evening, Stoic, Reflection" {...register("tags")} />
          <p className="text-xs text-muted-foreground">Tag persistence is coming soon; add notes for now.</p>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={() => close()} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
