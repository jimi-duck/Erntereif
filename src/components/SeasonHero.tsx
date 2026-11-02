import { CornerUpLeft } from 'lucide-react'
import { assetUrl } from '@/lib/assets'
import { currentMonth, monthName } from '@/lib/calendar'
import { cn } from '@/lib/cn'
import { SEASON_TONE_CLASS, type SeasonSummary } from '@/lib/seasonality'
import { useAppStore } from '@/store/useAppStore'
import { BrushStroke } from './BrushStroke'
import { MonthStrip } from './MonthStrip'
import type { Month } from '@/types/produce'

interface Props {
  month: Month
  countryName: string
  summary: SeasonSummary
}

/** A loose, overlapping cluster, like a plate in an old herbal. */
const PLATE = [
  { id: 'pumpkin', className: 'left-[2%] top-[22%] w-[52%] -rotate-6', z: 'z-10' },
  { id: 'kale', className: 'right-[2%] top-[0%] w-[50%] rotate-3', z: 'z-20' },
  { id: 'leek', className: 'left-[14%] top-[0%] w-[40%] rotate-[-14deg]', z: 'z-0' },
  { id: 'apple', className: 'right-[10%] bottom-[0%] w-[40%] rotate-6', z: 'z-30' },
]

export function SeasonHero({ month, countryName, summary }: Props) {
  const resetToCurrentMonth = useAppStore((s) => s.resetToCurrentMonth)
  const isThisMonth = month === currentMonth()

  return (
    <section>
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="animate-fade-up">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="label text-ink-400">{countryName}</span>
            <span className={cn(SEASON_TONE_CLASS[summary.tone])}>{summary.label}</span>
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

          <h1 className="display-black mt-7 max-w-3xl text-[3rem] leading-[1] text-ink-900 sm:text-[4.5rem] lg:text-[5.5rem]">
            Was der{' '}
            <em className="relative inline-block font-normal italic">
              {monthName(month)}
              <BrushStroke className="pointer-events-none absolute -bottom-[0.12em] left-0 h-[0.28em] w-full text-sage-500" />
            </em>{' '}
            bringt
          </h1>

          <p className="mt-8 max-w-sm text-[0.95rem] leading-relaxed text-ink-500">
            {summary.description}
          </p>

          <dl className="mt-10 flex flex-wrap gap-x-14 gap-y-5 border-t border-line pt-6">
            <Stat value={summary.inSeason} label="Wird geerntet" />
            <Stat value={summary.total} label="Jetzt zu haben" />
          </dl>
        </div>

        {/* Opacity-only entrance: a transform here would isolate the images
            from the paper and stop the multiply blend. */}
        <div
          className="animate-fade-in relative mx-auto hidden aspect-square w-full max-w-md rounded-[2rem] bg-plate sm:block lg:max-w-none"
          aria-hidden
        >
          {PLATE.map((p) => (
            <img
              key={p.id}
              src={assetUrl(`/produce/${p.id}.png`)}
              alt=""
              width={512}
              height={512}
              decoding="async"
              className={cn('illustration absolute', p.className, p.z)}
            />
          ))}
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
      <dd className="display-black text-[3rem] tabular-nums leading-[1] text-ink-900 sm:text-[3.75rem]">
        {value}
      </dd>
      <dt className="label mt-2 text-ink-400">{label}</dt>
    </div>
  )
}
