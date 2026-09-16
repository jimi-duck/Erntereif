import { CornerUpLeft } from 'lucide-react'
import { currentMonth, monthName } from '@/lib/calendar'
import { cn } from '@/lib/cn'
import { SEASON_TONE_CLASS, type SeasonSummary } from '@/lib/seasonality'
import { useAppStore } from '@/store/useAppStore'
import { MonthStrip } from './MonthStrip'
import type { Month } from '@/types/produce'

interface Props {
  month: Month
  countryName: string
  summary: SeasonSummary
}

export function SeasonHero({ month, countryName, summary }: Props) {
  const resetToCurrentMonth = useAppStore((s) => s.resetToCurrentMonth)
  const isThisMonth = month === currentMonth()

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14">
        <div className="animate-fade-up">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="label text-ink-400">{countryName}</span>
            <span className={cn('label rounded-sm px-2 py-1', SEASON_TONE_CLASS[summary.tone])}>
              {summary.label}
            </span>
            {!isThisMonth && (
              <button
                type="button"
                onClick={resetToCurrentMonth}
                className="label ml-auto flex items-center gap-1.5 text-ink-400 transition hover:text-ink-900"
              >
                <CornerUpLeft className="size-3.5" aria-hidden />
                Zurück zum {monthName(currentMonth())}
              </button>
            )}
          </div>

          <h1 className="display-black mt-7 max-w-5xl text-[3.25rem] leading-[0.84] text-ink-900 sm:text-[5.5rem] lg:text-[7rem]">
            Was der <span className="underscore">{monthName(month)}</span> bringt
          </h1>

          <p className="mt-8 max-w-sm text-[0.95rem] leading-relaxed text-ink-500">
            {summary.description}
          </p>

          <dl className="mt-10 flex flex-wrap gap-x-14 gap-y-5 border-t border-line pt-6">
            <Stat value={summary.inSeason} label="Wird geerntet" />
            <Stat value={summary.total} label="Jetzt zu haben" />
          </dl>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <MonthStrip />
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dd className="display-black text-[3.25rem] tabular-nums leading-[0.82] text-ink-900 sm:text-[4rem]">
        {value}
      </dd>
      <dt className="label mt-2.5 text-ink-400">{label}</dt>
    </div>
  )
}
