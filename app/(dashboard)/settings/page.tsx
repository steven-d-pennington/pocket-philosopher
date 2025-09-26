import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Settings",
  description:
    "Configure integrations, privacy controls, and feature flags to support the evolving Pocket Philosopher experience.",
  path: "/settings",
});

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure notifications, privacy controls, integrations, and feature flags. This page will
          orchestrate multiple modal flows and rely heavily on shared utilities in lib/hooks.
        </p>
      </div>
      <section className="grid gap-4 rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Planned sections</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Notification preferences with timezone awareness.</li>
          <li>Privacy modes for reflections and practice visibility.</li>
          <li>Integrations (email, calendar, push) with feature-flag awareness.</li>
        </ul>
      </section>
    </div>
  );
}

