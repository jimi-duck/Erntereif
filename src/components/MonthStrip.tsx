import { useEffect, useRef } from 'react'
import { MONTHS, currentMonth } from '@/lib/calendar'
import { cn } from '@/lib/cn'
import { useAppStore } from '@/store/useAppStore'
import type { Month } from '@/types/produce'

/** The twelve months as a numbered index, the active one ruled in neon. */
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
      className="no-scrollbar flex overflow-x-auto scroll-p-4 border-t border-line"
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
            className="group relative min-w-[4.75rem] flex-1 px-3 pb-3.5 pt-3 text-left sm:min-w-0"
          >
            <span
              className={cn(
                'absolute inset-x-0 top-0 h-[3px] transition',
                selected ? 'bg-neon-500' : 'bg-transparent group-hover:bg-ink-300',
              )}
              aria-hidden
            />
            <span
              className={cn(
                'label block text-[10px] tabular-nums transition',
                selected ? 'text-ink-900' : 'text-ink-300',
              )}
              aria-hidden
            >
              {String(m.number).padStart(2, '0')}
              {m.number === thisMonth && <span className="ml-1 text-neon-600">●</span>}
            </span>
            <span
              className={cn(
                'label mt-1 block whitespace-nowrap transition',
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
