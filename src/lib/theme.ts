/**
 * Light and dark, and which one is in force.
 *
 * `data-theme` on <html> is always a resolved `light` or `dark` — never
 * "system" — so the CSS needs one selector and no media query. The boot script
 * in `index.html` sets it before first paint; this module keeps it in step
 * afterwards.
 */
export type Theme = 'light' | 'dark'

/** Kept in step with the boot script in `index.html`. */
export const THEME_KEY = 'erntereif-theme'

const PAGE: Record<Theme, string> = { light: '#ffffff', dark: '#0f1412' }

export const systemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

/** The stored choice, or null when the reader is simply following their OS. */
export const storedTheme = (): Theme | null => {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    // Private windows and blocked storage both throw on read.
    return null
  }
}

export const resolveTheme = (): Theme => storedTheme() ?? systemTheme()

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  // So the browser chrome and the address bar match the page.
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', PAGE[theme])
}

/**
 * Store only a deliberate departure from the OS.
 *
 * Choosing dark on a machine already set to dark clears the override rather
 * than writing it, so someone who never disagrees with their OS keeps
 * following it forever — including when they change it later.
 */
export function setTheme(theme: Theme): void {
  try {
    if (theme === systemTheme()) localStorage.removeItem(THEME_KEY)
    else localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Not being able to remember the choice is not a reason to not apply it.
  }
  applyTheme(theme)
}
