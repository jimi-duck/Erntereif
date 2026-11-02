import { assetUrl } from '@/lib/assets'
import { CountrySelect } from './CountrySelect'

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-page">
      <div className="mx-auto flex max-w-6xl items-center justify-between h-[4.5rem] gap-4 px-4 sm:px-6">
        <a href="#main" className="flex items-center gap-3 rounded" aria-label="Erntereif — Saisonkalender">
          <img
            src={assetUrl('/erntereif-logo.png')}
            alt=""
            width={900}
            height={449}
            className="illustration h-14 w-auto "
          />
          <span className="label hidden border-l border-line pl-3 text-ink-400 sm:block">
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
