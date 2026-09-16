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
                Back to {monthName(currentMonth())}
              </button>
            )}
          </div>

          <h1 className="display mt-6 max-w-4xl text-[2.75rem] leading-[0.9] tracking-[-0.045em] text-ink-900 sm:text-[4.5rem] lg:text-[5.5rem]">
            What <span className="underscore">{monthName(month)}</span> is giving
          </h1>

          <p className="mt-7 max-w-md text-[0.95rem] leading-relaxed text-ink-500">
            {summary.description}
          </p>

          <dl className="mt-10 flex flex-wrap gap-x-14 gap-y-5 border-t border-line pt-6">
            <Stat value={summary.inSeason} label="Being harvested" />
            <Stat value={summary.total} label="Available now" />
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
      <dd className="display text-[2.75rem] tabular-nums leading-[0.85] tracking-[-0.04em] text-ink-900 sm:text-5xl">
        {value}
      </dd>
      <dt className="label mt-2.5 text-ink-400">{label}</dt>
    </div>
  )
}
