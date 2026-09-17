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
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t-2 border-ink-900 pt-3">
              <span className="label tabular-nums text-ink-300" aria-hidden>
                {String(sectionIndex + 1).padStart(2, '0')}
              </span>
              <h2
                id={`section-${section.key}`}
                className="display-black text-[1.6rem] leading-none text-ink-900 sm:text-[2rem]"
              >
                {section.title}
              </h2>
              {local && <span className="label text-ink-300">{local}</span>}
              <span className="display-black ml-auto text-[1.6rem] tabular-nums leading-none text-ink-300 sm:text-[2rem]">
                {section.items.length}
              </span>
            </div>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-400">{section.blurb}</p>

            {/* A section can run to sixty crops, so it is blocked by type. With
                only one type in it — under a category filter, or in a thin
                month — the heading would just restate the filter, so it goes. */}
            {section.groups.map((group, groupIndex) => {
              const groupOffset =
                offset + section.groups.slice(0, groupIndex).reduce((n, g) => n + g.items.length, 0)

              return (
                <div key={group.category} className={groupIndex === 0 ? 'mt-7' : 'mt-10'}>
                  {section.groups.length > 1 && (
                    // Sticks under the filter bar so you always know which
                    // block you are in, and can skip one you do not want.
                    // Phones keep it static: a third sticky layer would eat
                    // most of the screen.
                    <div className="flex items-baseline gap-2 border-t border-line bg-white pb-4 pt-2.5 sm:sticky sm:top-[var(--chrome-h)] sm:z-10">
                      <h3 className="label text-ink-500">{group.label}</h3>
                      <span className="label tabular-nums text-ink-300">{group.items.length}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5 lg:grid-cols-6">
                    {group.items.map((resolved, i) => (
                      <ProduceCard
                        key={resolved.item.id}
                        resolved={resolved}
                        index={groupOffset + i}
                        onSelect={onSelect}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}
