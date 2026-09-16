import { COUNTRIES } from '@/lib/calendar'
import { CAR_KG_CO2E_PER_KM } from '@/lib/co2'
import { PRODUCE } from '@/lib/seasonality'
import { Wordmark } from './Wordmark'

const NOTES = [
  {
    title: 'The calendar',
    body: (
      <>
        {PRODUCE.length} vegetables, fruits and herbs mapped across {COUNTRIES.length} countries.
        Harvest windows follow published agricultural calendars — the{' '}
        <abbr title="Bundeszentrum für Ernährung" className="no-underline">
          BZfE
        </abbr>{' '}
        Saisonkalender for Germany, and national grower calendars elsewhere.
      </>
    ),
  },
  {
    title: 'Where dates vary',
    body: (
      <>
        Seasons shift by a week or two with the weather, the region and the variety. Southern
        growers start earlier, northern ones finish later. Treat every window as the middle of a
        range, not a hard edge.
      </>
    ),
  },
  {
    title: 'Carbon figures',
    body: (
      <>
        Indicative kg CO₂e per kg, comparing local and in-season against the dominant out-of-season
        alternative. Driving comparisons assume {CAR_KG_CO2E_PER_KM} kg CO₂e per car kilometre. For
        comparing options, not for carbon accounting.
      </>
    ),
  },
]

export function Footer() {
  return (
    <footer className="mt-24 bg-ink-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="display max-w-2xl text-[2rem] leading-[0.95] tracking-[-0.04em] text-white sm:text-[3.25rem]">
          Eat what is <span className="text-neon-500">growing next door</span>.
        </p>

        <div className="mt-14 grid gap-9 sm:grid-cols-3">
          {NOTES.map((note) => (
            <div key={note.title}>
              <h2 className="label border-t border-white/20 pt-3 text-neon-500">{note.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{note.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-3 border-t border-white/15 pt-6">
          <Wordmark className="size-7" />
          <p className="display text-base lowercase text-white">stay local</p>
          <p className="label ml-auto text-white/35">Seasonal Almanac</p>
        </div>
      </div>
    </footer>
  )
}
