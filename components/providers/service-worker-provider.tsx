"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface DraftPayload {
  id: string;
  [key: string]: unknown;
}

interface DraftSyncMessageEventData {
  type: typeof SERVICE_WORKER_DRAFT_SYNC_EVENT;
  drafts?: DraftPayload[];
}

interface QueueDraftMessageEventData {
  type: typeof SERVICE_WORKER_DRAFT_QUEUE_EVENT;
  draft: DraftPayload;
}

export const SERVICE_WORKER_DRAFT_SYNC_EVENT = "POCKET_PHILOSOPHER_DRAFTS_SYNCED";
export const SERVICE_WORKER_DRAFT_QUEUE_EVENT = "POCKET_PHILOSOPHER_QUEUE_DRAFT";

export interface ServiceWorkerContextValue {
  queueDraft: (draft: DraftPayload) => void;
  pendingDrafts: DraftPayload[];
  consumePendingDrafts: () => DraftPayload[];
}

const ServiceWorkerContext = createContext<ServiceWorkerContextValue | null>(null);

const isServiceWorkerSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator;

export function ServiceWorkerProvider({ children }: { children: ReactNode }) {
  const [queuedDrafts, setQueuedDrafts] = useState<DraftPayload[]>([]);
  const [pendingDrafts, setPendingDrafts] = useState<DraftPayload[]>([]);

  const queuedDraftsRef = useRef(queuedDrafts);
  const pendingDraftsRef = useRef(pendingDrafts);

  useEffect(() => {
    queuedDraftsRef.current = queuedDrafts;
  }, [queuedDrafts]);

  useEffect(() => {
    pendingDraftsRef.current = pendingDrafts;
  }, [pendingDrafts]);

  const flushQueuedDraftToController = useCallback((draft: DraftPayload) => {
    if (!isServiceWorkerSupported()) return;

    const controller = navigator.serviceWorker.controller;
    if (!controller) return;

    const message: QueueDraftMessageEventData = {
      type: SERVICE_WORKER_DRAFT_QUEUE_EVENT,
      draft,
    };

    controller.postMessage(message);
  }, []);

  const queueDraft = useCallback(
    (draft: DraftPayload) => {
      setQueuedDrafts((current) => {
        const next = [...current, draft];
        return next;
      });

      flushQueuedDraftToController(draft);
    },
    [flushQueuedDraftToController],
  );

  const consumePendingDrafts = useCallback(() => {
    if (!pendingDraftsRef.current.length) {
      return [];
    }

    const drafts = [...pendingDraftsRef.current];
    pendingDraftsRef.current = [];
    setPendingDrafts([]);
    return drafts;
  }, []);

  const registerDraftMessageListener = useCallback(
    (handler: (drafts: DraftPayload[]) => void) => {
      if (!isServiceWorkerSupported()) {
        return () => undefined;
      }

      const container = navigator.serviceWorker;

      const listener = (event: MessageEvent<DraftSyncMessageEventData>) => {
        if (event.data?.type !== SERVICE_WORKER_DRAFT_SYNC_EVENT) return;

        const drafts = Array.isArray(event.data.drafts) ? event.data.drafts : [];
        handler(drafts);
      };

      container.addEventListener("message", listener);

      return () => {
        container.removeEventListener("message", listener);
      };
    },
    [],
  );

  useEffect(() => {
    const unsubscribe = registerDraftMessageListener((drafts) => {
      setPendingDrafts(drafts);
    });

    return unsubscribe;
  }, [registerDraftMessageListener]);

  useEffect(() => {
    if (!queuedDraftsRef.current.length) return;
    setQueuedDrafts([]);
  }, [pendingDrafts]);

  const value = useMemo<ServiceWorkerContextValue>(
    () => ({
      queueDraft,
      pendingDrafts,
      consumePendingDrafts,
    }),
    [consumePendingDrafts, pendingDrafts, queueDraft],
  );

  return <ServiceWorkerContext.Provider value={value}>{children}</ServiceWorkerContext.Provider>;
}

export function useServiceWorker() {
  const context = useContext(ServiceWorkerContext);

  if (!context) {
    throw new Error("useServiceWorker must be used within a ServiceWorkerProvider");
  }

  return context;
}
