import { CATEGORY_LABEL, CATEGORY_ORDER } from '@/lib/seasonality'
import type { Category, CountryCode, ResolvedProduce, SeasonStatus } from '@/types/produce'

export type SectionKey = 'harvest' | 'storage' | 'soon' | 'out'

interface SectionDefinition {
  key: SectionKey
  title: string
  blurb: string
  statuses: SeasonStatus[]
  /**
   * The heading in the selected country's own language, the way a bilingual
   * grower's calendar prints it. Germany gets nothing extra — the title is
   * already German.
   */
  local: Partial<Record<CountryCode, string>>
}

export const SECTIONS: SectionDefinition[] = [
  {
    key: 'harvest',
    title: 'Jetzt in Saison',
    blurb: 'Diesen Monat geerntet.',
    statuses: ['peak', 'starting', 'ending'],
    local: { FR: 'De saison', IT: 'Di stagione', NL: 'In het seizoen', GB: 'In season' },
  },
  {
    key: 'storage',
    title: 'Aus dem Lager',
    blurb: 'Früher im Jahr geerntet und hier eingelagert.',
    statuses: ['stored'],
    local: { FR: 'Conservation', IT: 'Da conservazione', NL: 'Bewaargroenten', GB: 'From store' },
  },
  {
    key: 'soon',
    title: 'Kommt nächsten Monat',
    blurb: 'Warte noch ein paar Wochen, dann lohnt es sich.',
    statuses: ['soon'],
    local: { FR: 'Le mois prochain', IT: 'Il mese prossimo', NL: 'Volgende maand', GB: 'Next month' },
  },
  {
    key: 'out',
    title: 'Außer Saison',
    blurb: 'Wächst hier, aber nicht um diese Jahreszeit.',
    statuses: ['out-of-season'],
    local: { FR: 'Hors saison', IT: 'Fuori stagione', NL: 'Buiten het seizoen', GB: 'Out of season' },
  },
]

/** A type block inside a section: vegetables, fruit or herbs. */
export interface ProduceGroup {
  category: Category
  label: string
  items: ResolvedProduce[]
}

export interface ProduceSection extends SectionDefinition {
  items: ResolvedProduce[]
  /**
   * The same items, blocked by type. A section can run to sixty-odd crops, and
   * a grid that long needs a shape — so it is broken into vegetables, then
   * fruit, then herbs, each alphabetical and each headed with its count.
   */
  groups: ProduceGroup[]
}

/** Split a resolved list into the printed sections, dropping any that are empty. */
export function groupIntoSections(list: ResolvedProduce[]): ProduceSection[] {
  return SECTIONS.map((section) => {
    const items = list.filter((r) => section.statuses.includes(r.status))
    return {
      ...section,
      items,
      groups: CATEGORY_ORDER.map((category) => ({
        category,
        label: CATEGORY_LABEL[category],
        items: items.filter((r) => r.item.category === category),
      })).filter((group) => group.items.length > 0),
    }
  }).filter((section) => section.items.length > 0)
}
