import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { currentMonth } from '@/lib/calendar'
import { adoptLegacyKey } from '@/lib/storage'
import type { Category, CountryCode, Month } from '@/types/produce'

export type CategoryFilter = Category | 'all'
export type SupplyFilter = 'all' | 'harvest' | 'storage'

interface AppState {
  country: CountryCode
  month: Month
  category: CategoryFilter
  supply: SupplyFilter
  search: string
  selectedId: string | null

  setCountry: (country: CountryCode) => void
  setMonth: (month: Month) => void
  stepMonth: (delta: number) => void
  resetToCurrentMonth: () => void
  setCategory: (category: CategoryFilter) => void
  setSupply: (supply: SupplyFilter) => void
  setSearch: (search: string) => void
  select: (id: string | null) => void
  clearFilters: () => void
}

// Before `persist` reads anything. See `adoptLegacyKey`.
adoptLegacyKey('stay-local', 'erntereif')

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      country: 'DE',
      month: currentMonth(),
      category: 'all',
      supply: 'all',
      search: '',
      selectedId: null,

      setCountry: (country) => set({ country }),
      setMonth: (month) => set({ month }),
      stepMonth: (delta) => set((s) => ({ month: (((s.month - 1 + delta) % 12) + 12) % 12 + 1 })),
      resetToCurrentMonth: () => set({ month: currentMonth() }),
      setCategory: (category) => set({ category }),
      setSupply: (supply) => set({ supply }),
      setSearch: (search) => set({ search }),
      select: (selectedId) => set({ selectedId }),
      clearFilters: () => set({ category: 'all', supply: 'all', search: '' }),
    }),
    {
      name: 'erntereif',
      // The month should follow the calendar on each visit; only the choice of
      // country is worth remembering between sessions.
      partialize: (state) => ({ country: state.country }),
    },
  ),
)
