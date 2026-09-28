import { useState, useCallback, useEffect } from 'react';

/**
 * useLocalStorage — PT. BARAK IOMS
 * Authoritative persistent client-side storage hook.
 *
 * Persitence Rules:
 * 1. Checks window.localStorage.getItem(key).
 * 2. If data ALREADY exists in localStorage (key is not null/empty and parsed successfully):
 *    USE THAT DATA. NEVER overwrite or fallback to initial dummy data on page refresh!
 * 3. Only if key does NOT exist in localStorage:
 *    Seed localStorage with initialValue (the entity's original mock dummy data) and return it.
 * 4. All updates via setValue synchronously commit to window.localStorage and trigger 'storage' event.
 * 5. Listens to window 'storage' events for cross-tab and cross-component reactivity.
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      // If localStorage already has an entry for this key, keep and use it
      if (item !== null && item !== 'undefined' && item !== 'null' && item !== '') {
        const parsed = JSON.parse(item);
        if (parsed !== undefined && parsed !== null) {
          return parsed;
        }
      }
      // If key is not in localStorage yet, initialize with initialValue (dummy data fallback)
      const fallback = typeof initialValue === 'function' ? initialValue() : initialValue;
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    } catch (error) {
      console.warn(`[useLocalStorage] Error reading ${key} from localStorage:`, error);
      const fallback = typeof initialValue === 'function' ? initialValue() : initialValue;
      return fallback;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = typeof value === 'function' ? value(prev) : value;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            window.dispatchEvent(new Event('storage'));
          }
          return valueToStore;
        });
      } catch (error) {
        console.error(`[useLocalStorage] Error saving ${key} to localStorage:`, error);
      }
    },
    [key]
  );

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item !== null && item !== 'undefined' && item !== 'null' && item !== '') {
          const parsed = JSON.parse(item);
          if (parsed !== undefined && parsed !== null) {
            setStoredValue(parsed);
          }
        }
      } catch (err) {
        console.warn(`[useLocalStorage] Error syncing ${key}:`, err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;

