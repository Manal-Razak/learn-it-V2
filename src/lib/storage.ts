/**
 * localStorage wrappers that never throw. Storage can be unavailable
 * (private mode, blocked site data, sandboxed previews) and the app must
 * keep working in memory when it is.
 */
export function readJSON<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
