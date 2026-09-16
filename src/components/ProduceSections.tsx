import { ProduceCard } from './ProduceCard'
import type { ProduceSection } from '@/lib/sections'
import type { CountryCode } from '@/types/produce'

interface Props {
  sections: ProduceSection[]
  country: CountryCode
  onSelect: (id: string) => void
}

export function ProduceSections({ sections, country, onSelect }: Props) {
  // Running offset so the entrance stagger continues across section boundaries.
  const offsets = sections.reduce<number[]>(
    (acc, section, i) => [...acc, acc[i] + section.items.length],
    [0],
  )

  return (
    <div className="space-y-14">
      {sections.map((section, sectionIndex) => {
        const local = section.local[country]
        const offset = offsets[sectionIndex]

        return (
          <section key={section.key} aria-labelledby={`section-${section.key}`}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-ink-900 pt-3.5">
              <h2
                id={`section-${section.key}`}
                className="display text-lg leading-none tracking-[-0.03em] text-ink-900"
              >
                {section.title}
              </h2>
              {local && <span className="label text-ink-300">{local}</span>}
              <span className="display ml-auto text-lg tabular-nums leading-none text-ink-400">
                {section.items.length}
              </span>
            </div>
            <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-ink-400">{section.blurb}</p>

            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5">
              {section.items.map((resolved, i) => (
                <ProduceCard
                  key={resolved.item.id}
                  resolved={resolved}
                  index={offset + i}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
