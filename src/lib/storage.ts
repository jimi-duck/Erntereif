/**
 * Carry a value over from a storage key the app used to use, once.
 *
 * Renaming the app renamed its `localStorage` keys, which would otherwise drop
 * everyone's remembered country and theme on the release that shipped the new
 * name, and leave the old keys sitting in their browser forever. This adopts
 * the old value if the new key is empty, and clears the old key either way, so
 * it runs at most once per visitor.
 *
 * Safe to delete once no one is coming back from a build older than the
 * rename.
 */
export function adoptLegacyKey(from: string, to: string): void {
  try {
    const legacy = localStorage.getItem(from)
    if (legacy === null) return
    if (localStorage.getItem(to) === null) localStorage.setItem(to, legacy)
    localStorage.removeItem(from)
  } catch {
    // Private windows and blocked storage both throw; nothing to migrate.
  }
}
