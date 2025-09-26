"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getPersistStorageEngine, persistKey } from "@/lib/stores/persist-utils";

interface UseOfflineDraftOptions<T> {
  key: string;
  initialValue: T;
  serialize?: (value: T) => string | undefined;
  deserialize?: (value: string) => T;
}

interface UseOfflineDraftReturn<T> {
  value: T;
  setValue: (value: T) => void;
  clear: (nextValue?: T) => void;
  hydrated: boolean;
  hasDraft: boolean;
}

const defaultSerialize = <T,>(value: T) => JSON.stringify(value);
const defaultDeserialize = <T,>(value: string) => JSON.parse(value) as T;

export function useOfflineDraft<T>({
  key,
  initialValue,
  serialize = defaultSerialize,
  deserialize = defaultDeserialize,
}: UseOfflineDraftOptions<T>): UseOfflineDraftReturn<T> {
  const storageKey = useMemo(() => persistKey(`draft:${key}`), [key]);
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  const previousKeyRef = useRef(storageKey);
  const previousInitialValueRef = useRef(initialValue);

  useEffect(() => {
    const keyChanged = previousKeyRef.current !== storageKey;
    const initialChanged = previousInitialValueRef.current !== initialValue;

    if ((keyChanged || initialChanged) && hydrated) {
      setHydrated(false);
    }

    if (keyChanged) {
      previousKeyRef.current = storageKey;
    }
    if (initialChanged) {
      previousInitialValueRef.current = initialValue;
    }
  }, [storageKey, initialValue, hydrated]);

  useEffect(() => {
    if (hydrated) return;

    let cancelled = false;
    const storage = getPersistStorageEngine();

    Promise.resolve(storage.getItem(storageKey)).then((stored) => {
      if (cancelled) return;

      if (stored !== null && typeof stored !== "undefined" && stored !== "") {
        try {
          setValue(deserialize(stored));
        } catch (error) {
          console.warn(`Failed to parse offline draft for ${storageKey}`, error);
          try {
            storage.removeItem(storageKey);
          } catch (removeError) {
            console.warn(`Unable to clear corrupt draft for ${storageKey}`, removeError);
          }
          setValue(initialValue);
        }
      } else {
        setValue(initialValue);
      }

      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, [deserialize, hydrated, initialValue, storageKey]);

  useEffect(() => {
    if (!hydrated) return;

    const storage = getPersistStorageEngine();
    const serialized = serialize(value);

    if (serialized === undefined) {
      storage.removeItem(storageKey);
      return;
    }

    storage.setItem(storageKey, serialized);
  }, [hydrated, serialize, storageKey, value]);

  const clear = useCallback(
    (nextValue?: T) => {
      const storage = getPersistStorageEngine();
      storage.removeItem(storageKey);
      if (typeof nextValue !== "undefined") {
        setValue(nextValue);
        return;
      }
      setValue(initialValue);
    },
    [initialValue, storageKey],
  );

  return {
    value,
    setValue,
    clear,
    hydrated,
    hasDraft: hydrated && value !== initialValue,
  };
}
