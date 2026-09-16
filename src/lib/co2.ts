import type { Co2Profile, ImportMode } from '@/types/produce'

/**
 * Figures in `co2` are indicative kg CO2e per kg of produce, comparing local
 * and in-season against the dominant out-of-season alternative on European
 * shelves. They sit inside the ranges published in food-LCA work such as the
 * IFEU and Öko-Institut studies used for the German market: open-field
 * regional produce around 0.2–0.4, cold-stored produce slightly higher,
 * heated-glasshouse produce roughly 2–3.5, and air-freighted produce 4–11.
 * They are for comparing options, not for carbon accounting.
 */

/** Average new-car tailpipe emissions, kg CO2e per km — used for the "same as driving" comparison. */
export const CAR_KG_CO2E_PER_KM = 0.12

export const IMPORT_MODE_LABEL: Record<ImportMode, string> = {
  air: 'eingeflogen',
  sea: 'per Schiff',
  road: 'per Lkw',
  greenhouse: 'beheiztes Gewächshaus',
}

export interface Co2Comparison {
  saving: number
  savingPercent: number
  /** Kilometres of driving avoided per kilo bought local instead of imported. */
  carKm: number
  multiplier: number
  modeLabel: string
}

export function compareCo2(co2: Co2Profile): Co2Comparison {
  const saving = co2.imported - co2.local
  return {
    saving,
    savingPercent: Math.round((saving / co2.imported) * 100),
    carKm: saving / CAR_KG_CO2E_PER_KM,
    multiplier: co2.imported / co2.local,
    modeLabel: IMPORT_MODE_LABEL[co2.importMode],
  }
}

/** German decimal comma — 0,5 kg, not 0.5 kg. */
const de = (value: number, digits: number) =>
  value.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const formatKg = (value: number) => `${de(value, value < 10 ? 1 : 0)} kg`

export const formatCarKm = (km: number) =>
  km >= 10 ? `${de(km, 0)} km` : `${de(km, 1)} km`
