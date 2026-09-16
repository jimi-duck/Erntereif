import { Search, Sprout, Warehouse, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAppStore, type CategoryFilter, type SupplyFilter } from '@/store/useAppStore'

const CATEGORY_TABS: Array<{ value: CategoryFilter; label: string }> = [
  { value: 'all', label: 'Alles' },
  { value: 'vegetable', label: 'Gemüse' },
  { value: 'fruit', label: 'Obst' },
  { value: 'herb', label: 'Kräuter' },
]

const SUPPLY_TABS: Array<{ value: SupplyFilter; label: string; icon: typeof Sprout | null }> = [
  { value: 'all', label: 'Alle', icon: null },
  { value: 'harvest', label: 'Frisch geerntet', icon: Sprout },
  { value: 'storage', label: 'Aus dem Lager', icon: Warehouse },
]

interface Props {
  /** Result count for the live region, so screen readers hear filtering happen. */
  resultCount: number
}

export function FilterBar({ resultCount }: Props) {
  const { category, supply, search, setCategory, setSupply, setSearch } = useAppStore()

  return (
    <div className="sticky top-[61px] z-20 border-y border-line bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-2.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
          <div role="group" aria-label="Nach Kategorie filtern" className="flex items-center gap-4">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                aria-pressed={category === tab.value}
                onClick={() => setCategory(tab.value)}
                className={cn(
                  'label relative py-2 transition',
                  category === tab.value ? 'text-ink-900' : 'text-ink-400 hover:text-ink-900',
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'absolute inset-x-0 bottom-0 h-[3px] transition',
                    category === tab.value ? 'bg-neon-500' : 'bg-transparent',
                  )}
                  aria-hidden
                />
              </button>
            ))}
          </div>

          <div role="group" aria-label="Nach Herkunft filtern" className="flex items-center gap-1.5">
            {SUPPLY_TABS.map((tab) => {
              const Icon = tab.icon
              const selected = supply === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSupply(tab.value)}
                  title={tab.label}
                  className={cn(
                    'label flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 transition',
                    selected
                      ? 'border-ink-900 bg-ink-900 text-white'
                      : 'border-line text-ink-400 hover:border-ink-900 hover:text-ink-900',
                  )}
                >
                  {Icon && <Icon className="size-3.5" aria-hidden />}
                  <span className={cn(tab.value !== 'all' && 'hidden sm:inline')}>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="relative lg:w-64">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Spargel, fraise, kale…"
            aria-label="Suchen"
            className="w-full rounded-sm border border-line bg-surface py-2 pl-9 pr-8 text-sm text-ink-900 placeholder:text-ink-400 transition focus:border-ink-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neon-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Suche löschen"
              className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-ink-400 transition hover:bg-surface-deep hover:text-ink-900"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          )}
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {resultCount} Sorten passen zu den Filtern.
      </p>
    </div>
  )
}
