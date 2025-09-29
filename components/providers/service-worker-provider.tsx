"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { clientEnv } from "@/lib/env-validation";
import {
  clearDraftQueue,
  queueDraftLocally,
  readDraftQueue,
  type OfflineDraft,
} from "@/lib/offline/drafts";

interface OfflineSyncContextValue {
  isOnline: boolean;
  pendingDrafts: OfflineDraft[];
  queueDraft: (draft: OfflineDraft) => void;
  promptInstall: () => Promise<void>;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface SyncCapableRegistration extends ServiceWorkerRegistration {
  sync?: {
    register: (tag: string) => Promise<void>;
  };
}

async function registerDraftSync(
  registration: ServiceWorkerRegistration | null | undefined,
): Promise<void> {
  try {
    await (registration as SyncCapableRegistration | null | undefined)?.sync?.register("sync-drafts");
  } catch (error: unknown) {
    console.warn("Failed to schedule draft sync", error);
  }
}

const OfflineSyncContext = createContext<OfflineSyncContextValue>({
  isOnline: true,
  pendingDrafts: [],
  queueDraft: () => undefined,
  promptInstall: async () => undefined,
});

function shouldEnableServiceWorker(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  if (!("serviceWorker" in navigator)) {
    return false;
  }
  if (process.env.NODE_ENV === "development") {
    return Boolean(clientEnv.PWA_DEV);
  }
  return true;
}

function captureClientEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const client = (window as unknown as { posthog?: { capture?: (e: string, props?: Record<string, unknown>) => void } }).posthog;
  client?.capture?.(event, properties);
}

function registerDraftMessageListener(
  onDraftsSynced: (drafts: OfflineDraft[]) => void,
): () => void {
  const listener = (event: MessageEvent) => {
    if (event.data?.type === "SYNC_DRAFTS" && Array.isArray(event.data.drafts)) {
      onDraftsSynced(event.data.drafts as OfflineDraft[]);
      toast.success("Offline drafts synced", { description: "We re-applied your saved updates." });
      captureClientEvent("client_offline_event", { action: "draft_synced", count: event.data.drafts.length });
    }
  };
  navigator.serviceWorker.addEventListener("message", listener);
  return () => navigator.serviceWorker.removeEventListener("message", listener);
}

async function enqueueDraftWithWorker(draft: OfflineDraft) {
  if (typeof navigator === "undefined" || !navigator.serviceWorker?.controller) {
    return;
  }
  navigator.serviceWorker.controller.postMessage({
    type: "QUEUE_DRAFT",
    payload: draft,
  });
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    await registerDraftSync(registration);
  } catch (error: unknown) {
    console.warn("Background sync registration failed", error);
  }
}

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [pendingDrafts, setPendingDrafts] = useState<OfflineDraft[]>(() => readDraftQueue());
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!shouldEnableServiceWorker()) {
      return;
    }

    let isMounted = true;
    let unregisterMessageListener: (() => void) | null = null;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/service-worker.js", {
          scope: "/",
        });
        if (!isMounted) return;
        setRegistration(reg);
        unregisterMessageListener = registerDraftMessageListener(() => {
          setPendingDrafts([]);
          clearDraftQueue();
        });
      } catch (error) {
        console.error("Service worker registration failed", error);
      }
    };

    register();

    const handleBeforeInstallPrompt = (rawEvent: Event) => {
      const event = rawEvent as BeforeInstallPromptEvent;
      event.preventDefault();
      setInstallPrompt(event);
      toast("Install Pocket Philosopher", {
        description: "Add the coach to your home screen for offline access.",
        action: {
          label: "Install",
          onClick: () => {
            void (async () => {
              await event.prompt();
            })();
          },
        },
      });
      captureClientEvent("client_offline_event", { action: "install_prompt" });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online", { description: "We are syncing the latest data." });
      void registerDraftSync(registration);
      captureClientEvent("client_offline_event", { action: "online" });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You are offline", {
        description: "We'll queue your updates until the connection returns.",
      });
      captureClientEvent("client_offline_event", { action: "offline" });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      isMounted = false;
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unregisterMessageListener?.();
    };
  }, [registration]);

  useEffect(() => {
    if (!registration) return;

    const notifyUpdate = () => {
      const waiting = registration.waiting;
      if (!waiting) return;
      toast("Update available", {
        description: "Reload to apply the latest offline features.",
        action: {
          label: "Reload",
          onClick: () => {
            waiting.postMessage({ type: "SKIP_WAITING" });
            waiting.addEventListener("statechange", () => {
              if (waiting.state === "activated") {
                window.location.reload();
              }
            });
          },
        },
      });
    };

    registration.addEventListener("updatefound", notifyUpdate);
    notifyUpdate();

    return () => {
      registration.removeEventListener("updatefound", notifyUpdate);
    };
  }, [registration]);

  const queueDraft = useCallback((draft: OfflineDraft) => {
    queueDraftLocally(draft);
    setPendingDrafts(readDraftQueue());
    void enqueueDraftWithWorker(draft);
    captureClientEvent("client_offline_event", { action: "draft_queued", draftId: draft.id });
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => undefined);
    setInstallPrompt(null);
  }, [installPrompt]);

  const value = useMemo<OfflineSyncContextValue>(
    () => ({
      isOnline,
      pendingDrafts,
      queueDraft,
      promptInstall,
    }),
    [isOnline, pendingDrafts, queueDraft, promptInstall],
  );

  return <OfflineSyncContext.Provider value={value}>{children}</OfflineSyncContext.Provider>;
}

export function useOfflineSync(): OfflineSyncContextValue {
  return useContext(OfflineSyncContext);
}
