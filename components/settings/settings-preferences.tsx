"use client";

import { useEffect } from "react";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePersonaTheme } from "@/lib/hooks/use-persona-theme";
import { useProfile, useUpdateProfileMutation } from "@/lib/hooks/use-profile";

interface SettingsFormValues {
  timezone: string;
  privacy_level: string;
  notifications_enabled: boolean;
  blended_coach_chats: boolean;
}

const privacyOptions = [
  { value: "standard", label: "Standard (default)" },
  { value: "stealth", label: "Stealth (hide reflections)" },
  { value: "community", label: "Community (share anonymized insights)" },
];

export function SettingsPreferences() {
  const { data: profile, isLoading } = useProfile();
  const mutation = useUpdateProfileMutation();
  const { theme } = usePersonaTheme();

  const form = useForm<SettingsFormValues>({
    defaultValues: {
      timezone: "UTC",
      privacy_level: "standard",
      notifications_enabled: true,
      blended_coach_chats: false,
    },
  });

  useEffect(() => {
    if (!profile) return;
    form.reset({
      timezone: profile.timezone ?? "UTC",
      privacy_level: profile.privacy_level ?? "standard",
      notifications_enabled: profile.notifications_enabled ?? true,
      blended_coach_chats: profile.blended_coach_chats ?? false,
    });
  }, [profile, form]);

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values, {
      onSuccess: () => toast.success("Settings saved"),
      onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to save settings"),
    });
  });

  return (
    <section className="persona-card p-6 shadow-philosophy">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Preferences</p>
        <h2 className="text-2xl font-semibold font-serif flex items-center gap-2">
          <span className="persona-accent text-lg">{theme.decorative.divider}</span>
          Notifications & privacy
        </h2>
      </header>
      <form className="mt-6 space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            placeholder="e.g. America/Los_Angeles"
            disabled={isLoading || mutation.isPending}
            {...form.register("timezone")}
          />
          <p className="text-xs text-muted-foreground">
            Used for scheduling reminders and summarizing reflections on the correct day.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="privacy_level">Privacy level</Label>
          <select
            id="privacy_level"
            className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm"
            disabled={isLoading || mutation.isPending}
            {...form.register("privacy_level")}
          >
            {privacyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 rounded-3xl border persona-card bg-muted/20 px-4 py-3">
          <input
            id="notifications_enabled"
            type="checkbox"
            className="size-4 accent-persona"
            disabled={isLoading || mutation.isPending}
            {...form.register("notifications_enabled")}
          />
          <div>
            <Label htmlFor="notifications_enabled" className="font-serif">Enable email reminders</Label>
            <p className="text-xs text-muted-foreground">
              Toggle global reminders. Specific practice reminders can be controlled per habit.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-3xl border persona-card bg-muted/20 px-4 py-3">
          <input
            id="blended_coach_chats"
            type="checkbox"
            className="size-4 accent-persona"
            disabled={isLoading || mutation.isPending}
            {...form.register("blended_coach_chats")}
          />
          <div>
            <Label htmlFor="blended_coach_chats" className="font-serif">Enable blended coach chats</Label>
            <p className="text-xs text-muted-foreground">
              When enabled, coaches can reference messages from other personas in the same conversation.
            </p>
          </div>
        </div>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save settings"}
        </Button>
      </form>
    </section>
  );
}
