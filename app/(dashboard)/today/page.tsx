import { buildMetadata } from "@/lib/metadata";
import { TodayPageClient } from "./client";

export const metadata = buildMetadata({
  title: "Today",
  description:
    "Check in on your intention, log practices, review Return Score tiles, and jump into coach conversations for the day.",
  path: "/today",
});

export default function TodayPage() {
  return <TodayPageClient />;
}
