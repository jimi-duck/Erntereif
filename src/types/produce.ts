/** ISO 3166-1 alpha-2 codes for the countries this app carries a calendar for. */
export type CountryCode = 'DE' | 'FR' | 'IT' | 'NL' | 'GB'

export type Category = 'vegetable' | 'fruit' | 'herb'

/** 1 = January … 12 = December. */
export type Month = number

/**
 * A country-specific override of the harvest calendar. Only present where the
 * local season genuinely differs from the German reference calendar — southern
 * growers start earlier, British growers finish later, Dutch glasshouses run
 * far longer than open fields.
 */
export interface RegionalSeason {
  monthsInSeason: Month[]
  monthsInStorage: Month[]
}

export type ImportMode = 'air' | 'sea' | 'road' | 'greenhouse'

/**
 * Indicative greenhouse-gas intensity in kg CO2e per kg of produce, comparing
 * local + in-season against the dominant out-of-season alternative on European
 * shelves. See `src/lib/co2.ts` for the basis of these figures.
 */
export interface Co2Profile {
  local: number
  imported: number
  importMode: ImportMode
  /** Typical origin of the out-of-season alternative, e.g. "Peru". */
  origin: string
}

/**
 * Drawing instructions consumed by `scripts/generate-illustrations.mjs`.
 * Illustrations are duotone and share the brand's two inks, so an item carries
 * only its shape language — and, rarely, an accent override.
 */
export interface IllustrationSpec {
  archetype: string
  /** Overrides the default neon accent. See `INKS` in `scripts/palette.mjs`. */
  accent?: string
}

export interface ProduceItem {
  id: string
  nameEN: string
  nameDE: string
  category: Category
  /** Months the crop is actively harvested from open ground or local glass. */
  monthsInSeason: Month[]
  /** Months it is available from domestic cellar / controlled-atmosphere store. */
  monthsInStorage: Month[]
  description: string
  storageTips: string
  pairingIdeas: string[]
  imageUrl: string
  /** Countries with meaningful local production. */
  region: CountryCode[]
  /** Name in each country's own language; falls back to nameEN. */
  localNames?: Partial<Record<CountryCode, string>>
  regionalSeasons?: Partial<Record<CountryCode, RegionalSeason>>
  culinaryTag: string
  flavorProfile: string
  recipeIdea: string
  co2: Co2Profile
  illustration: IllustrationSpec
}

/** Where an item sits in its cycle for the month currently being viewed. */
export type SeasonStatus =
  | 'peak'
  | 'starting'
  | 'ending'
  | 'soon'
  | 'stored'
  | 'out-of-season'

/** How the item reaches the table this month. */
export type SupplyKind = 'harvest' | 'storage' | 'none'

/** An item resolved against a specific month + country. */
export interface ResolvedProduce {
  item: ProduceItem
  status: SeasonStatus
  supply: SupplyKind
  months: RegionalSeason
  /** True when the calendar shown is the German reference, not country data. */
  usesReferenceCalendar: boolean
  localName: string
}
