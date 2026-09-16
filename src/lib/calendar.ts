import type { CountryCode, Month } from '@/types/produce'

export const MONTHS = [
  { number: 1, long: 'Januar', short: 'Jan', initial: 'J' },
  { number: 2, long: 'Februar', short: 'Feb', initial: 'F' },
  { number: 3, long: 'März', short: 'Mär', initial: 'M' },
  { number: 4, long: 'April', short: 'Apr', initial: 'A' },
  { number: 5, long: 'Mai', short: 'Mai', initial: 'M' },
  { number: 6, long: 'Juni', short: 'Jun', initial: 'J' },
  { number: 7, long: 'Juli', short: 'Jul', initial: 'J' },
  { number: 8, long: 'August', short: 'Aug', initial: 'A' },
  { number: 9, long: 'September', short: 'Sep', initial: 'S' },
  { number: 10, long: 'Oktober', short: 'Okt', initial: 'O' },
  { number: 11, long: 'November', short: 'Nov', initial: 'N' },
  { number: 12, long: 'Dezember', short: 'Dez', initial: 'D' },
] as const

export const monthName = (month: Month) => MONTHS[month - 1].long

export const currentMonth = (): Month => new Date().getMonth() + 1

/** Step through the calendar with December wrapping to January. */
export const wrapMonth = (month: number): Month => ((month + 11) % 12) + 1

export interface Country {
  code: CountryCode
  name: string
  /** Fits the header control on narrow screens. */
  shortName: string
  flag: string
  /** Shown when the app falls back to the German reference calendar. */
  calendarSource: string
}

export const COUNTRIES: Country[] = [
  { code: 'DE', name: 'Deutschland', shortName: 'Deutschland', flag: '🇩🇪', calendarSource: 'BZfE-Saisonkalender' },
  { code: 'FR', name: 'Frankreich', shortName: 'Frankreich', flag: '🇫🇷', calendarSource: 'Interfel / regionale Kalender' },
  { code: 'IT', name: 'Italien', shortName: 'Italien', flag: '🇮🇹', calendarSource: 'Regionale Erntekalender' },
  { code: 'NL', name: 'Niederlande', shortName: 'Niederlande', flag: '🇳🇱', calendarSource: 'Milieu Centraal Groentekalender' },
  { code: 'GB', name: 'Großbritannien', shortName: 'UK', flag: '🇬🇧', calendarSource: 'Britische Anbaukalender' },
]

export const countryByCode = (code: CountryCode): Country =>
  COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0]
