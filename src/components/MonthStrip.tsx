import { useEffect, useRef } from 'react'
import { MONTHS, currentMonth } from '@/lib/calendar'
import { cn } from '@/lib/cn'
import { useAppStore } from '@/store/useAppStore'
import type { Month } from '@/types/produce'

/** The twelve months as a numbered index, the active one on a sage watercolour blob. */
export function MonthStrip() {
  const month = useAppStore((s) => s.month)
  const setMonth = useAppStore((s) => s.setMonth)
  const railRef = useRef<HTMLDivElement>(null)
  const hasScrolled = useRef(false)
  const thisMonth = currentMonth()

  // The first pass jumps instantly so the strip is never left showing January.
  useEffect(() => {
    const el = railRef.current?.querySelector<HTMLElement>(`[data-month="${month}"]`)
    el?.scrollIntoView({
      behavior: hasScrolled.current ? 'smooth' : 'auto',
      block: 'nearest',
      inline: 'center',
    })
    hasScrolled.current = true
  }, [month])

  return (
    <div
      ref={railRef}
      role="group"
      aria-label="Monat"
      className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-px-4 border-t border-line"
    >
      {MONTHS.map((m) => {
        const selected = m.number === month
        return (
          <button
            key={m.number}
            type="button"
            data-month={m.number}
            aria-pressed={selected}
            aria-label={m.long}
            onClick={() => setMonth(m.number as Month)}
            className="group relative min-w-[4.5rem] flex-1 snap-center px-3 pb-4 pt-4 text-center sm:min-w-0"
          >
            <span className="relative mx-auto flex size-11 items-center justify-center" aria-hidden>
              {selected && (
                <svg
                  viewBox="0 0 48 48"
                  className="absolute inset-0 size-full text-sage-500"
                  fill="currentColor"
                >
                  <path
                    fillOpacity=".4"
                    d="M24.5 3.5c9.6-.4 19.6 6.3 20.6 16.4 1.1 10.5-5.6 24.5-18.8 25.2C14.4 45.8 3 37.7 2.9 25.3 2.8 13.600 12.8 4 24.5 3.500Z"
                  />
                  <path
                    fillOpacity=".25"
                    d="M25 6c8.2.2 16.1 6.8 16.3 15.6.2 9.900-7.700 20-17.600 19.700C13.800 41 6.700 32.8 7 23.900 7.300 14.4 15.5 5.8 25 6Z"
                  />
                </svg>
              )}
              <span
                className={cn(
                  'display relative text-xl tabular-nums transition',
                  selected ? 'text-ink-900' : 'text-ink-400 group-hover:text-ink-900',
                )}
              >
                {m.number}
              </span>
              {m.number === thisMonth && (
                <span className="absolute -bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-sage-600" />
              )}
            </span>
            <span
              className={cn(
                'label mt-2 block whitespace-nowrap transition',
                selected ? 'text-ink-900' : 'text-ink-400 group-hover:text-ink-900',
              )}
              aria-hidden
            >
              <span className="lg:hidden">{m.short}</span>
              <span className="hidden lg:inline">{m.long}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
