import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { ProfilePreferences } from "@/components/dashboard/profile-preferences";
import { ProfileSummary } from "@/components/dashboard/profile-summary";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Profile",
  description:
    "Review account basics, persona roster, and notification cadence settings connected to Supabase profiles.",
  path: "/profile",
});

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Profile"
        title="Account & preferences"
        description="Review Supabase-backed profile data, confirm notification cadence, and inspect the persona defaults fueling your daily guidance."
      />
      <ProfileSummary />
      <ProfilePreferences />
    </div>
  );
}
