"use client";

import { useProfile } from "@/lib/hooks/use-profile";

export function ProfilePreferences() {
  const { data, isLoading, error } = useProfile();

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Preferences</p>
        <h2 className="text-2xl font-semibold">Persona & notifications</h2>
      </header>
      <div className="mt-6 grid gap-4 text-sm md:grid-cols-2">
        {isLoading && <p className="text-muted-foreground">Loading preferences…</p>}
        {error && <p className="text-muted-foreground">Unable to load preferences.</p>}
        {data ? (
          <>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Coach persona</p>
              <p className="text-sm font-medium text-foreground">{data.preferred_persona ?? "Marcus"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Guiding virtue</p>
              <p className="text-sm font-medium text-foreground">{data.preferred_virtue ?? "Wisdom"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Experience level</p>
              <p className="text-sm font-medium text-foreground">{data.experience_level ?? "Just starting"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Notifications</p>
              <p className="text-sm font-medium text-foreground">
                {data.notifications_enabled ? "Enabled" : "Disabled"}
                {data.daily_practice_time ? ` • ${data.daily_practice_time}` : ""}
              </p>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
