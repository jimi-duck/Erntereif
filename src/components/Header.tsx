import { CountrySelect } from './CountrySelect'
import { Wordmark } from './Wordmark'

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <a href="#main" className="flex items-center gap-2.5 rounded">
          <Wordmark />
          <span className="display whitespace-nowrap text-xl lowercase leading-none tracking-[-0.035em] text-ink-900">
            stay local
          </span>
          <span className="label hidden border-l border-line pl-2.5 text-ink-400 sm:block">
            Seasonal Almanac
          </span>
        </a>
        <CountrySelect />
      </div>
    </header>
  )
}
