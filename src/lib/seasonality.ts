import rawProduce from '@/data/seasonalProduce.json'
import type {
  Category,
  CountryCode,
  Month,
  ProduceItem,
  RegionalSeason,
  ResolvedProduce,
  SeasonStatus,
  SupplyKind,
} from '@/types/produce'
import { wrapMonth } from './calendar'

export const PRODUCE = rawProduce as ProduceItem[]

/**
 * The harvest calendar for one item in one country. Falls back to the German
 * reference calendar when no country-specific data exists, and says so, rather
 * than silently presenting German months as local ones.
 */
export function calendarFor(
  item: ProduceItem,
  country: CountryCode,
): { months: RegionalSeason; usesReferenceCalendar: boolean } {
  const override = item.regionalSeasons?.[country]
  if (override) return { months: override, usesReferenceCalendar: false }
  return {
    months: { monthsInSeason: item.monthsInSeason, monthsInStorage: item.monthsInStorage },
    usesReferenceCalendar: country !== 'DE',
  }
}

export const localNameFor = (item: ProduceItem, country: CountryCode): string =>
  item.localNames?.[country] ?? item.nameDE

/** Resolve one item against a specific month and country. */
export function resolveItem(
  item: ProduceItem,
  month: Month,
  country: CountryCode,
): ResolvedProduce {
  const { months, usesReferenceCalendar } = calendarFor(item, country)
  const inSeason = months.monthsInSeason.includes(month)
  const inStorage = months.monthsInStorage.includes(month)
  const startsNext = months.monthsInSeason.includes(wrapMonth(month + 1))
  const startedLast = months.monthsInSeason.includes(wrapMonth(month - 1))

  let status: SeasonStatus
  if (inSeason) {
    if (!startedLast && startsNext) status = 'starting'
    else if (startedLast && !startsNext) status = 'ending'
    else status = 'peak'
  } else if (inStorage) {
    status = 'stored'
  } else if (startsNext) {
    status = 'soon'
  } else {
    status = 'out-of-season'
  }

  const supply: SupplyKind = inSeason ? 'harvest' : inStorage ? 'storage' : 'none'

  return { item, status, supply, months, usesReferenceCalendar, localName: localNameFor(item, country) }
}

export interface StatusPresentation {
  label: string
  /** Tailwind classes for the badge. */
  className: string
  /** Sort weight — available produce first. */
  rank: number
}

export const STATUS_PRESENTATION: Record<SeasonStatus, StatusPresentation> = {
  peak: { label: 'In Saison', className: 'bg-ink-900 text-white', rank: 0 },
  starting: { label: 'Geht los', className: 'bg-neon-500 text-ink-900', rank: 1 },
  ending: { label: 'Letzte Wochen', className: 'bg-coral-500 text-white', rank: 2 },
  stored: { label: 'Aus dem Lager', className: 'bg-corn-500 text-ink-900', rank: 3 },
  soon: { label: 'Nächsten Monat', className: 'bg-white text-ink-900 ring-1 ring-ink-900', rank: 4 },
  'out-of-season': {
    label: 'Außer Saison',
    className: 'bg-white text-ink-400 ring-1 ring-line',
    rank: 5,
  },
}

export const CATEGORY_LABEL: Record<Category, string> = {
  vegetable: 'Gemüse',
  fruit: 'Obst',
  herb: 'Kräuter',
}

/** Every item grown in the given country, resolved for the given month. */
export function resolveAll(month: Month, country: CountryCode): ResolvedProduce[] {
  return PRODUCE.filter((item) => item.region.includes(country)).map((item) =>
    resolveItem(item, month, country),
  )
}

export type SeasonTone = 'peak' | 'high' | 'rising' | 'fading' | 'lean'

export interface SeasonSummary {
  label: string
  description: string
  tone: SeasonTone
  inSeason: number
  total: number
}

/**
 * The headline badge for a month: how much of the year's range is actually
 * being harvested right now, and whether the curve is rising or falling.
 */
export function summariseMonth(month: Month, country: CountryCode): SeasonSummary {
  const countFor = (m: Month) =>
    PRODUCE.filter((item) => item.region.includes(country)).filter((item) =>
      calendarFor(item, country).months.monthsInSeason.includes(m),
    ).length

  const monthly = Array.from({ length: 12 }, (_, i) => countFor((i + 1) as Month))
  const peakCount = Math.max(...monthly)
  const inSeason = monthly[month - 1]
  const previous = monthly[wrapMonth(month - 1) - 1]
  const ratio = peakCount === 0 ? 0 : inSeason / peakCount
  const rising = inSeason > previous

  const total = resolveAll(month, country).filter((r) => r.supply !== 'none').length

  if (ratio >= 0.8) {
    return {
      label: 'Hochsaison',
      description: 'Die vollsten Wochen im Jahr. Kauf reichlich und mach ein, was du nicht schaffst.',
      tone: 'peak',
      inSeason,
      total,
    }
  }
  if (ratio >= 0.6) {
    return {
      label: 'Volle Saison',
      description: 'Es kommt viel aus dem Boden. Kaum etwas muss weit reisen.',
      tone: 'high',
      inSeason,
      total,
    }
  }
  if (ratio >= 0.3) {
    return rising
      ? {
          label: 'Das Jahr geht los',
          description: 'Die ersten Ernten sind da. Ab jetzt kommt jede Woche Neues dazu.',
          tone: 'rising',
          inSeason,
          total,
        }
      : {
          label: 'Die letzten Ernten',
          description: 'Die letzten Sachen vom Feld, bevor Keller und Lager übernehmen.',
          tone: 'fading',
          inSeason,
          total,
        }
  }
  return {
    label: 'Keller & Lager',
    description: 'Fast nichts wird geerntet. Was da ist, kam im Herbst rein und hält sich gut.',
    tone: 'lean',
    inSeason,
    total,
  }
}

export const SEASON_TONE_CLASS: Record<SeasonTone, string> = {
  peak: 'bg-neon-500 text-ink-900',
  high: 'bg-neon-500 text-ink-900',
  rising: 'bg-corn-500 text-ink-900',
  fading: 'bg-coral-500 text-white',
  lean: 'bg-ink-900 text-white',
}
