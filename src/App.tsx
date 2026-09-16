import { useMemo } from 'react'
import { Footer } from '@/components/Footer'
import { FilterBar } from '@/components/FilterBar'
import { Header } from '@/components/Header'
import { EmptyState } from '@/components/EmptyState'
import { ProduceDetail } from '@/components/ProduceDetail'
import { ProduceSections } from '@/components/ProduceSections'
import { SeasonHero } from '@/components/SeasonHero'
import { useVisibleProduce } from '@/hooks/useVisibleProduce'
import { countryByCode, monthName } from '@/lib/calendar'
import { groupIntoSections } from '@/lib/sections'
import { resolveItem, summariseMonth, PRODUCE } from '@/lib/seasonality'
import { useAppStore } from '@/store/useAppStore'

export default function App() {
  const month = useAppStore((s) => s.month)
  const country = useAppStore((s) => s.country)
  const search = useAppStore((s) => s.search)
  const selectedId = useAppStore((s) => s.selectedId)
  const select = useAppStore((s) => s.select)
  const clearFilters = useAppStore((s) => s.clearFilters)

  const visible = useVisibleProduce()
  const sections = useMemo(() => groupIntoSections(visible), [visible])
  const summary = useMemo(() => summariseMonth(month, country), [month, country])

  const selected = useMemo(() => {
    if (!selectedId) return null
    const item = PRODUCE.find((p) => p.id === selectedId)
    return item ? resolveItem(item, month, country) : null
  }, [selectedId, month, country])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main id="main" className="flex-1">
        <SeasonHero month={month} countryName={countryByCode(country).name} summary={summary} />

        <FilterBar resultCount={visible.length} />

        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          {sections.length > 0 ? (
            <ProduceSections sections={sections} country={country} onSelect={select} />
          ) : (
            <EmptyState
              title={search ? `Nothing matches “${search}”` : 'Nothing here this month'}
              body={
                search
                  ? `No produce grown in ${countryByCode(country).name} matches that search. Try an English, German, French, Italian or Dutch name.`
                  : `Nothing fits these filters for ${monthName(month)}. Widen the category or supply filter to see the rest of the month.`
              }
              onReset={clearFilters}
            />
          )}
        </div>
      </main>

      <Footer />

      <ProduceDetail
        resolved={selected}
        month={month}
        country={country}
        onClose={() => select(null)}
      />
    </div>
  )
}
