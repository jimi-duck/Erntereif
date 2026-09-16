import { useMemo } from 'react'
import { CATEGORY_LABEL, STATUS_PRESENTATION, resolveAll } from '@/lib/seasonality'
import { useAppStore } from '@/store/useAppStore'
import type { ResolvedProduce } from '@/types/produce'

const haystack = (resolved: ResolvedProduce): string =>
  [
    resolved.localName,
    resolved.item.nameEN,
    resolved.item.nameDE,
    ...Object.values(resolved.item.localNames ?? {}),
    resolved.item.culinaryTag,
    resolved.item.category,
    CATEGORY_LABEL[resolved.item.category],
  ]
    .join(' ')
    .toLowerCase()

/**
 * The grid contents for the current month, country and filters.
 *
 * By default only produce you can actually get hold of is listed — harvested
 * now, out of local storage, or starting next month. A search widens that to
 * everything grown in the country, so looking up a crop out of season still
 * tells you when it comes back.
 */
export function useVisibleProduce(): ResolvedProduce[] {
  const month = useAppStore((s) => s.month)
  const country = useAppStore((s) => s.country)
  const category = useAppStore((s) => s.category)
  const supply = useAppStore((s) => s.supply)
  const search = useAppStore((s) => s.search)

  return useMemo(() => {
    const query = search.trim().toLowerCase()
    let list = resolveAll(month, country)

    if (query) list = list.filter((r) => haystack(r).includes(query))
    if (category !== 'all') list = list.filter((r) => r.item.category === category)

    if (supply === 'harvest') list = list.filter((r) => r.supply === 'harvest')
    else if (supply === 'storage') list = list.filter((r) => r.supply === 'storage')
    else if (!query) list = list.filter((r) => r.supply !== 'none' || r.status === 'soon')

    return list.sort(
      (a, b) =>
        STATUS_PRESENTATION[a.status].rank - STATUS_PRESENTATION[b.status].rank ||
        a.localName.localeCompare(b.localName, 'de'),
    )
  }, [month, country, category, supply, search])
}
