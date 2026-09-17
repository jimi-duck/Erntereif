import { useCallback, useEffect, useState } from 'react'
import {
  applyTheme,
  resolveTheme,
  setTheme,
  storedTheme,
  systemTheme,
  type Theme,
} from '@/lib/theme'

/**
 * The theme in force, and a way to flip it.
 *
 * Initial state is read off `<html>` rather than recomputed, because the boot
 * script has already resolved it — reading the DOM keeps React's first render
 * identical to what is on screen.
 */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setThemeState] = useState<Theme>(
    () => (document.documentElement.dataset.theme as Theme | undefined) ?? resolveTheme(),
  )

  // Follow the OS for as long as there is no explicit choice stored.
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (storedTheme()) return
      const next = systemTheme()
      applyTheme(next)
      setThemeState(next)
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      setTheme(next)
      return next
    })
  }, [])

  return { theme, toggle }
}
