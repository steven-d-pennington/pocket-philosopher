"use client";

import { useEffect, useMemo } from "react";

import { CheckCircle2, Circle, Flag } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile, useUpdateProfileMutation } from "@/lib/hooks/use-profile";
import { virtueOptions } from "@/components/practices/practice-form-constants";
import { getPersonaProfile } from "@/lib/ai/personas";

interface OnboardingFormValues {
  preferred_virtue: string;
  preferred_persona: string;
  experience_level: string;
  daily_practice_time: string;
  notifications_enabled: boolean;
}

const experienceLevels = ["Just starting", "Practicing", "Seasoned", "Coach/Guide"];

export function OnboardingChecklist() {
  const { data: profile, isLoading } = useProfile();
  const mutation = useUpdateProfileMutation();

  const form = useForm<OnboardingFormValues>({
    defaultValues: {
      preferred_virtue: "",
      preferred_persona: "marcus",
      experience_level: "Just starting",
      daily_practice_time: "08:00",
      notifications_enabled: true,
    },
  });

  useEffect(() => {
    if (!profile) return;
    form.reset({
      preferred_virtue: profile.preferred_virtue ?? "",
      preferred_persona: profile.preferred_persona ?? "marcus",
      experience_level: profile.experience_level ?? "Just starting",
      daily_practice_time: profile.daily_practice_time ?? "08:00",
      notifications_enabled: profile.notifications_enabled ?? false,
    });
  }, [profile, form]);

  const watchedValues = form.watch();
  const steps = useMemo(
    () => [
      {
        id: "virtue",
        label: "Choose a guiding virtue",
        completed: Boolean(watchedValues.preferred_virtue?.length),
      },
      {
        id: "persona",
        label: "Select your primary coach persona",
        completed: Boolean(watchedValues.preferred_persona?.length),
      },
      {
        id: "experience",
        label: "Share your experience level",
        completed: Boolean(watchedValues.experience_level?.length),
      },
      {
        id: "notifications",
        label: "Enable practice reminders",
        completed: Boolean(watchedValues.notifications_enabled),
      },
    ],
    [watchedValues],
  );

  const completedSteps = steps.filter((step) => step.completed).length + (profile?.onboarding_complete ? 1 : 0);
  const totalSteps = steps.length + 1;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  const handleSubmit = form.handleSubmit((values) => {
    mutation.mutate(
      {
        preferred_virtue: values.preferred_virtue,
        preferred_persona: values.preferred_persona,
        experience_level: values.experience_level,
        daily_practice_time: values.daily_practice_time,
        notifications_enabled: values.notifications_enabled,
      },
      {
        onSuccess: () => {
          toast.success("Onboarding preferences saved");
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Unable to save onboarding preferences");
        },
      },
    );
  });

  const markComplete = () => {
    mutation.mutate(
      { onboarding_complete: true },
      {
        onSuccess: () => toast.success("Onboarding marked complete"),
      },
    );
  };

  return (
    <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Setup checklist</p>
          <h2 className="text-2xl font-semibold text-foreground">Tune your Pocket Philosopher</h2>
          <p className="text-sm text-muted-foreground">
            Configure guidance defaults and notifications so practices, reflections, and coaches respond to your context.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Progress</span>
          <span className="text-2xl font-semibold text-foreground">{progress}%</span>
        </div>
      </header>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="preferred_virtue">Guiding virtue</Label>
          <select
            id="preferred_virtue"
            className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm"
            disabled={isLoading || mutation.isPending}
            {...form.register("preferred_virtue")}
          >
            <option value="">Select a virtue</option>
            {virtueOptions.map((virtue) => (
              <option key={virtue} value={virtue}>
                {virtue}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferred_persona">Coach persona</Label>
          <select
            id="preferred_persona"
            className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm"
            disabled={isLoading || mutation.isPending}
            {...form.register("preferred_persona")}
          >
            {(["marcus", "lao", "simone", "epictetus"] as const).map((id) => {
              const persona = getPersonaProfile(id);
              return (
                <option key={persona.id} value={persona.id}>
                  {persona.name}
                </option>
              );
            })}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="experience_level">Experience level</Label>
          <select
            id="experience_level"
            className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm"
            disabled={isLoading || mutation.isPending}
            {...form.register("experience_level")}
          >
            {experienceLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="daily_practice_time">Daily practice time</Label>
          <Input
            id="daily_practice_time"
            type="time"
            min="04:00"
            max="23:00"
            disabled={isLoading || mutation.isPending}
            {...form.register("daily_practice_time")}
          />
        </div>
        <div className="flex items-center gap-3 rounded-3xl border border-border/60 bg-muted/20 px-4 py-3 md:col-span-2">
          <input
            id="notifications_enabled"
            type="checkbox"
            className="size-4"
            disabled={isLoading || mutation.isPending}
            {...form.register("notifications_enabled")}
          />
          <div>
            <Label htmlFor="notifications_enabled">Enable daily reminders</Label>
            <p className="text-xs text-muted-foreground">
              Receive a nudge for reflections and practice tracking at your chosen time.
            </p>
          </div>
        </div>
        <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
          <Button type="submit" disabled={mutation.isPending} className="gap-2">
            <Flag className="size-4" aria-hidden />
            {mutation.isPending ? "Saving…" : "Save preferences"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={mutation.isPending || profile?.onboarding_complete}
            onClick={markComplete}
          >
            Mark onboarding complete
          </Button>
        </div>
      </form>

      <ul className="space-y-3 rounded-3xl border border-border/60 bg-muted/10 p-5 text-sm">
        {steps.map((step) => {
          const Icon = step.completed ? CheckCircle2 : Circle;
          return (
            <li key={step.id} className="flex items-center gap-3">
              <Icon className={step.completed ? "size-5 text-primary" : "size-5 text-muted-foreground"} aria-hidden />
              <span className={step.completed ? "text-foreground" : "text-muted-foreground"}>{step.label}</span>
            </li>
          );
        })}
        <li className="flex items-center gap-3">
          {(profile?.onboarding_complete ? <CheckCircle2 className="size-5 text-primary" aria-hidden /> : (
            <Circle className="size-5 text-muted-foreground" aria-hidden />
          ))}
          <span className={profile?.onboarding_complete ? "text-foreground" : "text-muted-foreground"}>
            Celebrate completion and explore the dashboard
          </span>
        </li>
      </ul>
    </section>
  );
}
