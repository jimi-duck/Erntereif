import { MONTHS } from '@/lib/calendar'
import { cn } from '@/lib/cn'
import type { Month, RegionalSeason } from '@/types/produce'

interface Props {
  months: RegionalSeason
  activeMonth: Month
}

/** A twelve-cell strip: harvest months, store months, and everything else. */
export function SeasonRibbon({ months, activeMonth }: Props) {
  return (
    <div>
      <ul className="flex gap-1" role="list">
        {MONTHS.map((m) => {
          const harvest = months.monthsInSeason.includes(m.number)
          const stored = months.monthsInStorage.includes(m.number)
          const active = m.number === activeMonth
          const state = harvest ? 'wird hier geerntet' : stored ? 'aus dem Lager' : 'nicht von hier'
          return (
            <li key={m.number} className="flex-1">
              <div
                title={`${m.long}: ${state}`}
                className={cn(
                  'label flex h-9 items-center justify-center rounded-sm transition',
                  harvest && 'bg-invert text-on-invert',
                  stored && 'bg-neon-500 text-on-accent',
                  !harvest && !stored && 'bg-surface text-ink-300',
                  active && 'ring-2 ring-neon-600 ring-offset-2 ring-offset-white',
                )}
              >
                <span aria-hidden>{m.initial}</span>
                <span className="sr-only">
                  {m.long}: {state}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
      <div className="label mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-ink-400">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-invert" aria-hidden /> Geerntet
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-neon-500" aria-hidden /> Aus dem Lager
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-surface" aria-hidden /> Nicht von hier
        </span>
      </div>
    </div>
  )
}
