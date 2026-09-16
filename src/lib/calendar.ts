import type { CountryCode, Month } from '@/types/produce'

export const MONTHS = [
  { number: 1, long: 'January', short: 'Jan', initial: 'J' },
  { number: 2, long: 'February', short: 'Feb', initial: 'F' },
  { number: 3, long: 'March', short: 'Mar', initial: 'M' },
  { number: 4, long: 'April', short: 'Apr', initial: 'A' },
  { number: 5, long: 'May', short: 'May', initial: 'M' },
  { number: 6, long: 'June', short: 'Jun', initial: 'J' },
  { number: 7, long: 'July', short: 'Jul', initial: 'J' },
  { number: 8, long: 'August', short: 'Aug', initial: 'A' },
  { number: 9, long: 'September', short: 'Sep', initial: 'S' },
  { number: 10, long: 'October', short: 'Oct', initial: 'O' },
  { number: 11, long: 'November', short: 'Nov', initial: 'N' },
  { number: 12, long: 'December', short: 'Dec', initial: 'D' },
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
  { code: 'DE', name: 'Germany', shortName: 'Germany', flag: '🇩🇪', calendarSource: 'BZfE seasonal calendar' },
  { code: 'FR', name: 'France', shortName: 'France', flag: '🇫🇷', calendarSource: 'Interfel / regional calendars' },
  { code: 'IT', name: 'Italy', shortName: 'Italy', flag: '🇮🇹', calendarSource: 'Regional harvest calendars' },
  { code: 'NL', name: 'Netherlands', shortName: 'Netherlands', flag: '🇳🇱', calendarSource: 'Milieu Centraal groentekalender' },
  { code: 'GB', name: 'United Kingdom', shortName: 'UK', flag: '🇬🇧', calendarSource: 'Seasonal UK grower calendars' },
]

export const countryByCode = (code: CountryCode): Country =>
  COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0]
