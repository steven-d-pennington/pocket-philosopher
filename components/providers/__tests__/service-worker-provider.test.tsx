import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

import { ServiceWorkerProvider, useOfflineSync } from "@/components/providers/service-worker-provider";
import type { OfflineDraft } from "@/lib/offline/drafts";

jest.mock("@/lib/offline/drafts", () => ({
  queueDraftLocally: jest.fn(),
  readDraftQueue: jest.fn(),
  clearDraftQueue: jest.fn(),
}));

jest.mock("sonner", () => {
  const toast = Object.assign(jest.fn(), {
    success: jest.fn(),
    warning: jest.fn(),
  });
  return { toast };
});

const draftsModule = jest.requireMock("@/lib/offline/drafts") as {
  queueDraftLocally: jest.Mock;
  readDraftQueue: jest.Mock;
  clearDraftQueue: jest.Mock;
};

const toast = jest.requireMock("sonner").toast as jest.Mock & {
  success: jest.Mock;
  warning: jest.Mock;
};

describe("ServiceWorkerProvider", () => {
  const originalServiceWorker = Object.getOwnPropertyDescriptor(navigator, "serviceWorker");
  const originalOnline = Object.getOwnPropertyDescriptor(navigator, "onLine");
  const controllerPostMessage = jest.fn();
  const registerEventListeners: Record<string, EventListener[]> = {};

  const registrationAddEventListener = jest.fn((type: string, handler: EventListener) => {
    registerEventListeners[type] = registerEventListeners[type] ?? [];
    registerEventListeners[type]?.push(handler);
  });

  const registrationRemoveEventListener = jest.fn((type: string, handler: EventListener) => {
    registerEventListeners[type] = registerEventListeners[type]?.filter((listener) => listener !== handler) ?? [];
  });

  const serviceWorkerAddEventListener = jest.fn((type: string, handler: EventListener) => {
    registerEventListeners[type] = registerEventListeners[type] ?? [];
    registerEventListeners[type]?.push(handler);
  });

  const serviceWorkerRemoveEventListener = jest.fn((type: string, handler: EventListener) => {
    registerEventListeners[type] = registerEventListeners[type]?.filter((listener) => listener !== handler) ?? [];
  });

  const syncRegisterMock = jest.fn().mockResolvedValue(undefined);
  const getRegistrationMock = jest.fn().mockResolvedValue({ sync: { register: syncRegisterMock } });
  const registerMock = jest.fn().mockResolvedValue({
    addEventListener: registrationAddEventListener,
    removeEventListener: registrationRemoveEventListener,
    waiting: null,
    sync: { register: syncRegisterMock },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(registerEventListeners).forEach((key) => delete registerEventListeners[key]);

    draftsModule.queueDraftLocally.mockClear();
    draftsModule.readDraftQueue.mockReset();
    draftsModule.clearDraftQueue.mockClear();
    draftsModule.readDraftQueue.mockReturnValue([]);

    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        controller: { postMessage: controllerPostMessage },
        register: registerMock,
        getRegistration: getRegistrationMock,
        addEventListener: serviceWorkerAddEventListener,
        removeEventListener: serviceWorkerRemoveEventListener,
      },
    });

    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
  });

  afterAll(() => {
    if (originalServiceWorker) {
      Object.defineProperty(navigator, "serviceWorker", originalServiceWorker);
    } else {
      // @ts-expect-error reset mocked property
      delete navigator.serviceWorker;
    }

    if (originalOnline) {
      Object.defineProperty(navigator, "onLine", originalOnline);
    } else {
      // @ts-expect-error reset mocked property
      delete navigator.onLine;
    }
  });

  it("queues drafts and schedules background sync when available", async () => {
    const draft: OfflineDraft = {
      id: "draft-1",
      payload: { content: "Remember to breathe" },
      createdAt: Date.now(),
    };

    draftsModule.readDraftQueue.mockReturnValueOnce([]).mockReturnValue([draft]);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ServiceWorkerProvider>{children}</ServiceWorkerProvider>
    );

    const { result } = renderHook(() => useOfflineSync(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      result.current.queueDraft(draft);
    });

    expect(registerMock).toHaveBeenCalledWith("/service-worker.js", { scope: "/" });
    expect(draftsModule.queueDraftLocally).toHaveBeenCalledWith(draft);
    expect(controllerPostMessage).toHaveBeenCalledWith({ type: "QUEUE_DRAFT", payload: draft });
    expect(getRegistrationMock).toHaveBeenCalled();
    expect(syncRegisterMock).toHaveBeenCalledWith("sync-drafts");
    expect(result.current.pendingDrafts).toEqual([draft]);
  });

  it("clears queued drafts when sync completion message is received", async () => {
    const draft: OfflineDraft = {
      id: "draft-2",
      payload: { content: "Offline entry" },
      createdAt: Date.now(),
    };

    draftsModule.readDraftQueue.mockReturnValueOnce([draft]).mockReturnValue([draft]);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ServiceWorkerProvider>{children}</ServiceWorkerProvider>
    );

    const { result } = renderHook(() => useOfflineSync(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.pendingDrafts).toEqual([draft]);

    const messageHandlers = registerEventListeners.message ?? [];
    expect(messageHandlers).toHaveLength(1);

    act(() => {
      messageHandlers[0]?.({ data: { type: "SYNC_DRAFTS", drafts: [draft] } } as unknown as MessageEvent);
    });

    expect(draftsModule.clearDraftQueue).toHaveBeenCalled();
    expect(result.current.pendingDrafts).toEqual([]);
    expect(toast.success).toHaveBeenCalledWith("Offline drafts synced", expect.any(Object));
  });

  it("handles beforeinstallprompt events and resolves promptInstall", async () => {
    draftsModule.readDraftQueue.mockReturnValue([]);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ServiceWorkerProvider>{children}</ServiceWorkerProvider>
    );

    const { result } = renderHook(() => useOfflineSync(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    const prompt = jest.fn().mockResolvedValue(undefined);
    const beforeInstallEvent = new Event("beforeinstallprompt");
    Object.defineProperties(beforeInstallEvent, {
      prompt: { value: prompt },
      userChoice: { value: Promise.resolve({ outcome: "accepted" as const }) },
    });

    await act(async () => {
      window.dispatchEvent(beforeInstallEvent);
    });

    await act(async () => {
      await result.current.promptInstall();
    });

    expect(prompt).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith("Install Pocket Philosopher", expect.any(Object));
  });
});
