import { act, render } from "@testing-library/react";

import {
  SERVICE_WORKER_DRAFT_QUEUE_EVENT,
  SERVICE_WORKER_DRAFT_SYNC_EVENT,
  ServiceWorkerProvider,
  type DraftPayload,
  useServiceWorker,
} from "../service-worker-provider";

describe("ServiceWorkerProvider", () => {
  type Listener = (event: { data?: { type?: string; drafts?: DraftPayload[] } }) => void;

  let listeners: Listener[];
  let controllerPostMessage: jest.Mock;

  beforeEach(() => {
    listeners = [];
    controllerPostMessage = jest.fn();

    const serviceWorker = {
      controller: {
        postMessage: controllerPostMessage,
      },
      addEventListener: jest.fn((event: string, listener: EventListener) => {
        if (event === "message") {
          listeners.push(listener as Listener);
        }
      }),
      removeEventListener: jest.fn((event: string, listener: EventListener) => {
        if (event === "message") {
          listeners = listeners.filter((registered) => registered !== listener);
        }
      }),
    } as unknown as ServiceWorkerContainer;

    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: serviceWorker,
    });
  });

  afterEach(() => {
    // @ts-expect-error - cleaning up test shim
    delete navigator.serviceWorker;
  });

  it("exposes recovered drafts when the service worker syncs them", () => {
    let context: ReturnType<typeof useServiceWorker> | undefined;

    function Consumer() {
      context = useServiceWorker();
      return null;
    }

    render(
      <ServiceWorkerProvider>
        <Consumer />
      </ServiceWorkerProvider>,
    );

    expect(listeners).toHaveLength(1);
    expect(context).toBeDefined();

    const syncedDrafts: DraftPayload[] = [
      { id: "1", table: "practices", payload: { content: "Reflect" } },
      { id: "2", table: "reflections", payload: { content: "Share" } },
    ];

    act(() => {
      listeners.forEach((listener) =>
        listener({
          data: { type: SERVICE_WORKER_DRAFT_SYNC_EVENT, drafts: syncedDrafts },
        }),
      );
    });

    expect(context?.pendingDrafts).toEqual(syncedDrafts);

    let consumed: DraftPayload[] = [];
    act(() => {
      consumed = context?.consumePendingDrafts() ?? [];
    });

    expect(consumed).toEqual(syncedDrafts);
    expect(context?.pendingDrafts).toEqual([]);
  });

  it("queues drafts for the active service worker controller", () => {
    let context: ReturnType<typeof useServiceWorker> | undefined;

    function Consumer() {
      context = useServiceWorker();
      return null;
    }

    render(
      <ServiceWorkerProvider>
        <Consumer />
      </ServiceWorkerProvider>,
    );

    const draft: DraftPayload = {
      id: "draft-1",
      table: "practices",
      payload: { content: "Offline draft" },
    };

    act(() => {
      context?.queueDraft(draft);
    });

    expect(controllerPostMessage).toHaveBeenCalledWith({
      type: SERVICE_WORKER_DRAFT_QUEUE_EVENT,
      draft,
    });
  });
});
