export interface OfflineDraft {
  id: string;
  payload: Record<string, unknown>;
  createdAt: number;
}

const STORAGE_KEY = "pp-offline-drafts";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function readDraftQueue(): OfflineDraft[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OfflineDraft[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => typeof item?.id === "string");
  } catch (error) {
    console.warn("Failed to parse offline drafts", error);
    return [];
  }
}

export function clearDraftQueue() {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}

export function queueDraftLocally(draft: OfflineDraft) {
  if (!isBrowser()) return;
  const existing = readDraftQueue().filter((item) => item.id !== draft.id);
  existing.push(draft);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function consumeDraftQueue(): OfflineDraft[] {
  const drafts = readDraftQueue();
  clearDraftQueue();
  return drafts;
}
