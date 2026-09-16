import type { CountryCode, ResolvedProduce, SeasonStatus } from '@/types/produce'

export type SectionKey = 'harvest' | 'storage' | 'soon' | 'out'

interface SectionDefinition {
  key: SectionKey
  title: string
  blurb: string
  statuses: SeasonStatus[]
  /**
   * The heading in the selected country's own language, the way a bilingual
   * grower's calendar prints it. English-speaking regions get nothing extra.
   */
  local: Partial<Record<CountryCode, string>>
}

export const SECTIONS: SectionDefinition[] = [
  {
    key: 'harvest',
    title: 'In season now',
    blurb: 'Cut, lifted or picked this month.',
    statuses: ['peak', 'starting', 'ending'],
    local: { DE: 'Saison', FR: 'De saison', IT: 'Di stagione', NL: 'In het seizoen' },
  },
  {
    key: 'storage',
    title: 'From the cellar',
    blurb: 'Lifted earlier in the year and kept in local store.',
    statuses: ['stored'],
    local: { DE: 'Lagerware', FR: 'Conservation', IT: 'Da conservazione', NL: 'Bewaargroenten' },
  },
  {
    key: 'soon',
    title: 'Coming next month',
    blurb: 'Worth waiting a few more weeks for.',
    statuses: ['soon'],
    local: { DE: 'Demnächst', FR: 'Le mois prochain', IT: 'Il mese prossimo', NL: 'Volgende maand' },
  },
  {
    key: 'out',
    title: 'Out of season',
    blurb: 'Grown here, but not at this time of year.',
    statuses: ['out-of-season'],
    local: { DE: 'Außer Saison', FR: 'Hors saison', IT: 'Fuori stagione', NL: 'Buiten het seizoen' },
  },
]

export interface ProduceSection extends SectionDefinition {
  items: ResolvedProduce[]
}

/** Split a resolved list into the printed sections, dropping any that are empty. */
export function groupIntoSections(list: ResolvedProduce[]): ProduceSection[] {
  return SECTIONS.map((section) => ({
    ...section,
    items: list.filter((r) => section.statuses.includes(r.status)),
  })).filter((section) => section.items.length > 0)
}
