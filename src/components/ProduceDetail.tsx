import { useCallback, useRef } from 'react'
import { ChefHat, Info, Refrigerator, Sparkles, X } from 'lucide-react'
import { assetUrl } from '@/lib/assets'
import { COUNTRIES, countryByCode, monthName } from '@/lib/calendar'
import { cn } from '@/lib/cn'
import { CATEGORY_LABEL, STATUS_PRESENTATION } from '@/lib/seasonality'
import { useModalBehaviour } from '@/hooks/useModalBehaviour'
import { Co2Panel } from './Co2Panel'
import { SeasonRibbon } from './SeasonRibbon'
import type { CountryCode, Month, ResolvedProduce } from '@/types/produce'

interface Props {
  resolved: ResolvedProduce | null
  month: Month
  country: CountryCode
  onClose: () => void
}

export function ProduceDetail({ resolved, month, country, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const handleClose = useCallback(() => onClose(), [onClose])
  useModalBehaviour(Boolean(resolved), panelRef, handleClose)

  if (!resolved) return null

  const { item, status, months, usesReferenceCalendar, localName } = resolved
  const presentation = STATUS_PRESENTATION[status]
  const showEnglish = localName !== item.nameEN
  const grownIn = COUNTRIES.filter((c) => item.region.includes(c.code))

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="presentation">
      <div
        className="animate-overlay-in absolute inset-0 bg-ink-900/60"
        onClick={handleClose}
        aria-hidden
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="produce-detail-title"
        className="animate-slide-up relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-sm bg-white shadow-2xl sm:max-h-[88vh] sm:max-w-3xl sm:rounded-sm sm:animate-scale-in"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-sm bg-white text-ink-900 shadow-sm transition hover:bg-surface-deep"
        >
          <X className="size-4" aria-hidden />
        </button>

        <div className="overflow-y-auto overscroll-contain">
          <div className="flex flex-col sm:flex-row">
            <img
              src={assetUrl(item.imageUrl)}
              alt=""
              width={256}
              height={256}
              className="h-44 w-full bg-surface object-contain p-6 sm:aspect-square sm:h-auto sm:w-56 sm:shrink-0 sm:p-10"
            />
            <div className="min-w-0 flex-1 p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('label rounded-sm px-2 py-1', presentation.className)}>
                  {presentation.label}
                </span>
                <span className="label rounded-sm border border-line px-2 py-1 text-ink-400">
                  {CATEGORY_LABEL[item.category]}
                </span>
              </div>
              <h2
                id="produce-detail-title"
                className="display mt-4 text-[2rem] leading-[0.95] tracking-[-0.035em] text-ink-900 sm:text-[2.5rem]"
              >
                {localName}
              </h2>
              {showEnglish && <p className="mt-1.5 text-base text-ink-400">{item.nameEN}</p>}
              <p className="mt-4 text-sm leading-relaxed text-ink-500">{item.description}</p>
              <div className="mt-5 flex items-center gap-2">
                <span className="label text-ink-300">Grown in</span>
                <span className="flex gap-1" aria-label={`Grown in ${grownIn.map((c) => c.name).join(', ')}`}>
                  {grownIn.map((c) => (
                    <span key={c.code} title={c.name} className="text-sm leading-none" aria-hidden>
                      {c.flag}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6 border-t border-line p-5 sm:p-7">
            <section>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="label text-ink-900">
                  Season in {countryByCode(country).shortName}
                </h3>
                <p className="label text-ink-300">Viewing {monthName(month)}</p>
              </div>
              <div className="mt-3.5">
                <SeasonRibbon months={months} activeMonth={month} />
              </div>
              {usesReferenceCalendar && (
                <p className="mt-4 flex items-start gap-2 rounded bg-corn-500/20 p-3 text-xs leading-relaxed text-ink-700">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-ink-900" aria-hidden />
                  <span>
                    No country calendar for this crop yet — the German reference calendar is shown.
                    Local dates may run a week or two either side.
                  </span>
                </p>
              )}
            </section>

            <div className="grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
              <Panel icon={Sparkles} title="Flavour">
                {item.flavorProfile}
              </Panel>
              <Panel icon={Refrigerator} title="Keeping it fresh">
                {item.storageTips}
              </Panel>
            </div>

            <section className="border-t border-line pt-6">
              <h3 className="label flex items-center gap-2 text-ink-900">
                <ChefHat className="size-3.5 text-neon-600" aria-hidden />
                In the kitchen
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-500">{item.recipeIdea}</p>
              <ul className="mt-4 flex flex-wrap gap-2" role="list">
                {item.pairingIdeas.map((idea) => (
                  <li
                    key={idea}
                    className="rounded-sm border border-line px-2.5 py-1.5 text-xs text-ink-600"
                  >
                    {idea}
                  </li>
                ))}
              </ul>
            </section>

            <Co2Panel co2={item.co2} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Panel({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Sparkles
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h3 className="label flex items-center gap-2 text-ink-900">
        <Icon className="size-3.5 text-neon-600" aria-hidden />
        {title}
      </h3>
      <p className="mt-2.5 text-sm leading-relaxed text-ink-500">{children}</p>
    </section>
  )
}
