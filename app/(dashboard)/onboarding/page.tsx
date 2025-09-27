import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { OnboardingChecklist } from "@/components/onboarding/onboarding-checklist";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Onboarding",
  description:
    "Configure preferences, persona defaults, and notifications to personalize the Pocket Philosopher experience.",
  path: "/onboarding",
});

export default function OnboardingPage() {
  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Onboarding"
        title="Personalize your companion"
        description="Answer a few prompts so daily practices, reflections, and AI coaches meet you where you are. Preferences update instantly across the dashboard."
      />
      <OnboardingChecklist />
      <section className="grid gap-4 rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground lg:grid-cols-3">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Why this matters</p>
          <p>
            Your onboarding selections seed the practice recommendations, coach personas, and reflection prompts surfaced
            throughout the app.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Next steps</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Log a morning intention on the Today page.</li>
            <li>Schedule your first practice cadence.</li>
            <li>Start a conversation with Marcus or switch personas.</li>
          </ul>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Support</p>
          <p>
            Need help? Visit the Help & Feedback hub for docs and diagnostics, or message the team in the #pocket-philosopher
            channel.
          </p>
        </div>
      </section>
    </div>
  );
}
