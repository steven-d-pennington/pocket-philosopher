"use client";

import { Wifi, WifiOff } from "lucide-react";

import { useOfflineSync } from "@/components/providers/service-worker-provider";
import { cn } from "@/lib/utils";

export function ConnectivityBanner() {
  const { isOnline, pendingDrafts } = useOfflineSync();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-destructive/95 text-destructive-foreground backdrop-blur supports-[backdrop-filter]:bg-destructive/90">
      <div className="container flex items-center justify-center gap-2 px-4 py-2 text-sm">
        <WifiOff className="size-4" />
        <span>You&apos;re offline</span>
        {pendingDrafts.length > 0 && (
          <span className="ml-2 rounded-full bg-destructive-foreground/20 px-2 py-0.5 text-xs">
            {pendingDrafts.length} pending
          </span>
        )}
        <div className="ml-auto flex items-center gap-1 text-xs opacity-75">
          <Wifi className="size-3" />
          <span>Auto-sync when back online</span>
        </div>
      </div>
    </div>
  );
}

export function ConnectivityIndicator() {
  const { isOnline } = useOfflineSync();

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs",
        isOnline ? "text-green-600" : "text-destructive",
      )}
    >
      {isOnline ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
      <span className="sr-only">{isOnline ? "Online" : "Offline"}</span>
    </div>
  );
}