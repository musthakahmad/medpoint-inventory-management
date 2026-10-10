/** Read browser storage defensively so malformed or unavailable storage cannot crash app startup. */
export function readStoredValue<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;

    try {
      const parsed: unknown = JSON.parse(raw);
      if (isValid(parsed)) return parsed;
    } catch {
      // Keep the original value below for manual recovery.
    }

    try {
      window.localStorage.setItem(`${key}_recovery_backup`, raw);
    } catch {
      // Storage may be full or disabled; returning the fallback is still safer than crashing.
    }
    console.warn(`MedPoint could not read saved data for "${key}". A recovery copy was attempted.`);
  } catch (error) {
    console.warn(`MedPoint browser storage is unavailable for "${key}".`, error);
  }
  return fallback;
}

export function writeStoredValue(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`MedPoint could not save "${key}" to this browser. Export or back up important data.`, error);
  }
}

export function removeStoredValue(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`MedPoint could not remove "${key}" from this browser.`, error);
  }
}

export const isArrayValue = <T,>(value: unknown): value is T[] => Array.isArray(value);
export const isObjectValue = <T extends Record<string, unknown> = Record<string, unknown>>(value: unknown): value is T =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
export const isRecordArray = <T,>(value: unknown): value is T[] =>
  Array.isArray(value) && value.every((item) => isObjectValue(item) && typeof item.id === 'string');
