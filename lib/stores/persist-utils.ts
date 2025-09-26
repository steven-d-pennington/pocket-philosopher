import { createJSONStorage, type StateStorage } from "zustand/middleware";

const STORE_KEY_PREFIX = "pp";

const memoryStorage = (() => {
  const store: Record<string, string> = {};
  const fallback: StateStorage = {
    getItem: (name) => (
      Object.prototype.hasOwnProperty.call(store, name) ? store[name] : null
    ),
    setItem: (name, value) => {
      store[name] = value;
    },
    removeItem: (name) => {
      delete store[name];
    },
  };

  return fallback;
})();

export const getPersistStorageEngine = (): StateStorage => {
  if (typeof window === "undefined") return memoryStorage;

  try {
    const storage = window.localStorage;
    const probeKey = `${STORE_KEY_PREFIX}__probe__`;
    storage.setItem(probeKey, probeKey);
    storage.removeItem(probeKey);
    return storage;
  } catch (error) {
    console.warn("LocalStorage unavailable, falling back to in-memory storage", error);
    return memoryStorage;
  }
};

export const createPersistStorage = <T>() => createJSONStorage<T>(() => getPersistStorageEngine());

export const persistKey = (name: string) => `${STORE_KEY_PREFIX}:${name}`;

export const persistVersion = 1;
