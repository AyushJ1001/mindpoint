import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * A custom storage hook compatible with react-use-cart's `storage` prop.
 *
 * react-use-cart's internal `useLocalStorage` has the signature:
 *   (key: string, initialValue: string) => [string, (value: string) => void]
 *
 * This hook mirrors that signature but persists to AsyncStorage.
 * It keeps a synchronous in-memory cache and writes through to
 * AsyncStorage asynchronously.
 */
export function useAsyncCartStorage(
  key: string,
  initialValue: string,
): [string, (value: string | Function) => void] {
  const [storedValue, setStoredValue] = useState<string>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((value) => {
        if (value !== null) {
          setStoredValue(value);
        }
      })
      .catch(() => {
        // Silently fall back to initial value
      })
      .finally(() => {
        setHydrated(true);
      });
  }, [key]);

  const setValue = useCallback(
    (value: string | Function) => {
      const resolved =
        typeof value === "function" ? value(storedValue) : value;
      setStoredValue(resolved);
      // Write through to AsyncStorage asynchronously
      AsyncStorage.setItem(key, resolved).catch(() => {
        // Silently ignore write errors
      });
    },
    [key, storedValue],
  );

  // Return initial value until hydrated to avoid flash
  return [hydrated ? storedValue : initialValue, setValue];
}
