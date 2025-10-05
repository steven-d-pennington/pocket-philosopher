import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { SettingsPreferences } from "@/components/settings/settings-preferences";
import { ModelPreferences } from "@/components/settings/model-preferences";
import { CommunitySettings } from "@/components/settings/community-settings";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Settings",
  description:
    "Configure integrations, privacy controls, and feature flags to support the evolving Pocket Philosopher experience.",
  path: "/settings",
});

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Settings"
        title="System preferences"
        description="Adjust timezone-aware notifications, privacy defaults, and forthcoming integrations for the Pocket Philosopher experience."
      />
      <SettingsPreferences />
      <CommunitySettings />
      <ModelPreferences />
      <section className="rounded-3xl border border-border/60 bg-muted/10 p-6 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Integrations (coming soon)</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Calendar sync for practice reminders.</li>
          <li>Slack and email digests summarizing Return Score trends.</li>
          <li>Service-worker powered push notifications.</li>
        </ul>
      </section>
    </div>
  );
}

