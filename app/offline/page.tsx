import { CloudOff, RefreshCw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Offline · Pocket Philosopher",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-dashed border-border bg-card/80 p-12 shadow-lg">
        <span className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <CloudOff className="size-8" aria-hidden />
        </span>
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">You&apos;re offline</h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Pocket Philosopher will sync your drafts and coach conversations once you reconnect. In the meantime, revisit your saved practices or capture thoughts that we&apos;ll send later.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => window.location.reload()} className="gap-2">
            Try again
            <RefreshCw className="size-4" aria-hidden />
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
