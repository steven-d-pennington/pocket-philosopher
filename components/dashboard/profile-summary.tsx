"use client";

import { useProfile } from "@/lib/hooks/use-profile";

export function ProfileSummary() {
  const { data, isLoading, error } = useProfile();

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Profile</p>
        <h2 className="text-2xl font-semibold">Account overview</h2>
      </header>
      <div className="mt-6 space-y-2 text-sm text-muted-foreground">
        {isLoading && <p>Loading profile…</p>}
        {error && <p>Unable to load profile data.</p>}
        {data ? (
          <>
            <p className="text-foreground">
              <span className="font-semibold">Email:</span> {data.email ?? "Unknown"}
            </p>
            <p>
              <span className="font-semibold">Preferred virtue:</span>{" "}
              {data.preferred_virtue ?? "Unset"}
            </p>
            <p>
              <span className="font-semibold">Persona:</span> {data.preferred_persona ?? "Marcus"}
            </p>
          </>
        ) : null}
      </div>
    </section>
  );
}
