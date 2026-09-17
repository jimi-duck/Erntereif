import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { CountrySelect } from './CountrySelect'
import { Wordmark } from './Wordmark'

export function Header() {
  const { theme, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-page">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <a href="#main" className="flex items-center gap-2.5 rounded">
          <Wordmark />
          <span className="display whitespace-nowrap text-xl lowercase leading-none tracking-[-0.035em] text-ink-900">
            erntereif
          </span>
          <span className="label hidden border-l border-line pl-2.5 text-ink-400 sm:block">
            Saisonkalender
          </span>
        </a>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-pressed={theme === 'dark'}
            aria-label={theme === 'dark' ? 'Zur hellen Ansicht wechseln' : 'Zur dunklen Ansicht wechseln'}
            title={theme === 'dark' ? 'Hell' : 'Dunkel'}
            className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-line text-ink-500 transition hover:border-ink-900 hover:text-ink-900"
          >
            {theme === 'dark' ? (
              <Sun className="size-4" aria-hidden />
            ) : (
              <Moon className="size-4" aria-hidden />
            )}
          </button>
          <CountrySelect />
        </div>
      </div>
    </header>
  )
}
