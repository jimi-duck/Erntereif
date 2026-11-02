import { COUNTRIES } from '@/lib/calendar'
import { CAR_KG_CO2E_PER_KM } from '@/lib/co2'
import { PRODUCE } from '@/lib/seasonality'
import { Wordmark } from './Wordmark'

const NOTES = [
  {
    title: 'Der Kalender',
    body: (
      <>
        {PRODUCE.length} Sorten Gemüse, Obst und Kräuter aus {COUNTRIES.length} Ländern. Die
        Erntezeiten kommen aus veröffentlichten Anbaukalendern — dem{' '}
        <abbr title="Bundeszentrum für Ernährung" className="no-underline">
          BZfE
        </abbr>
        -Saisonkalender für Deutschland und nationalen Kalendern für die anderen Länder.
      </>
    ),
  },
  {
    title: 'Warum die Daten schwanken',
    body: (
      <>
        Je nach Wetter, Gegend und Sorte verschiebt sich alles um ein, zwei Wochen. Im Süden geht es
        früher los, im Norden hört es später auf. Nimm jede Zeitspanne als Mitte, nicht als harte
        Grenze.
      </>
    ),
  },
  {
    title: 'Die CO₂-Zahlen',
    body: (
      <>
        Richtwerte in kg CO₂e pro kg: von hier und in Saison gegen das, was sonst außerhalb der
        Saison im Regal liegt. Beim Autovergleich rechnen wir mit {CAR_KG_CO2E_PER_KM} kg CO₂e pro
        Kilometer. Zum Vergleichen gedacht, nicht als CO₂-Bilanz.
      </>
    ),
  },
]

export function Footer() {
  return (
    <footer className="mt-24 bg-block text-[#faf6ee]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="display-black max-w-3xl text-[2.25rem] leading-[1] text-[#faf6ee] sm:text-[4rem]">
          Iss, was <em className="text-sage-300">nebenan wächst</em>.
        </p>

        <div className="mt-14 grid gap-9 sm:grid-cols-3">
          {NOTES.map((note) => (
            <div key={note.title}>
              <h2 className="label border-t border-white/20 pt-3 text-sage-300">{note.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#faf6ee]/70">{note.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-3 border-t border-white/15 pt-6">
          <Wordmark className="size-7" />
          <p className="display text-lg lowercase italic text-[#faf6ee]">erntereif</p>
          <p className="display ml-auto text-sm italic text-[#faf6ee]/70">
            Illustrationen in Aquarell
          </p>
        </div>
      </div>
    </footer>
  )
}
