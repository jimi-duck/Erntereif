import { ChevronDown } from 'lucide-react'
import { COUNTRIES, countryByCode } from '@/lib/calendar'
import { useAppStore } from '@/store/useAppStore'
import type { CountryCode } from '@/types/produce'

export function CountrySelect() {
  const country = useAppStore((s) => s.country)
  const setCountry = useAppStore((s) => s.setCountry)
  const active = countryByCode(country)

  return (
    <label className="relative flex items-center gap-2 rounded-sm border border-ink-900 py-1.5 pl-3 pr-8 transition hover:bg-surface focus-within:ring-2 focus-within:ring-neon-500">
      <span className="text-sm leading-none" aria-hidden>
        {active.flag}
      </span>
      <span className="sr-only">Country</span>
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value as CountryCode)}
        className="label cursor-pointer appearance-none bg-transparent text-ink-900 focus:outline-none"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code} className="tracking-normal">
            {c.shortName}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 size-3.5 text-ink-900" aria-hidden />
    </label>
  )
}
