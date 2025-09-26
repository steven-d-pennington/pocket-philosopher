import { CoachWorkspace } from "@/components/marcus/coach-workspace";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Coaches",
  description:
    "Explore streaming conversations with Pocket Philosopher personas and prepare instrumentation for AI orchestration.",
  path: "/marcus",
});

export default function MarcusPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Coaches</h1>
        <p className="text-sm text-muted-foreground">
          Persistent conversations with Pocket Philosopher personas. Chat in real time, switch
          mentors, and prepare for streaming responses once the AI orchestration layer is online.
        </p>
      </div>
      <CoachWorkspace />
    </div>
  );
}
