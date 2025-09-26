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
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Update personal preferences, persona roster, and notification cadence. This page
          interfaces with the /api/profile route and Supabase profiles table.
        </p>
      </div>
      <ProfileSummary />
      <section className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Upcoming enhancements</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Add editable forms connected to Zod validation schemas.</li>
          <li>Expose persona management and Return Score benchmarks.</li>
          <li>Enable account export/download options to honor privacy settings.</li>
        </ul>
      </section>
    </div>
  );
}
