import { CountrySelect } from './CountrySelect'
import { Wordmark } from './Wordmark'

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-page">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <a href="#main" className="flex items-center gap-2.5 rounded">
          <Wordmark />
          <span className="display whitespace-nowrap text-2xl lowercase italic leading-none text-ink-900">
            erntereif
          </span>
          <span className="label hidden border-l border-line pl-2.5 text-ink-400 sm:block">
            Saisonkalender
          </span>
        </a>
        <div className="flex items-center gap-2">
          <CountrySelect />
        </div>
      </div>
    </header>
  )
}
