import { ArrowUpRight } from 'lucide-react'
import { assetUrl } from '@/lib/assets'
import { LATIN_NAMES } from '@/lib/latinNames'
import { STATUS_PRESENTATION } from '@/lib/seasonality'
import type { ResolvedProduce } from '@/types/produce'

interface Props {
  resolved: ResolvedProduce
  onSelect: (id: string) => void
  /** Staggers the entrance animation across the grid. */
  index: number
}

export function ProduceCard({ resolved, onSelect, index }: Props) {
  const { item, status, localName } = resolved
  const showGerman = localName !== item.nameDE
  // The section heading already says "in season" / "from the cellar", so only
  // stamp the two statuses that carry urgency the heading cannot.
  const urgent = status === 'starting' || status === 'ending'
  const presentation = STATUS_PRESENTATION[status]
  const latin = LATIN_NAMES[item.id]

  // Opacity-only entrance and a `top` offset for the lift: a transform on the
  // card would isolate the illustration and stop it multiplying into the paper.
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      style={{ animationDelay: `${Math.min(index, 14) * 24}ms` }}
      className="group animate-fade-in relative top-0 flex flex-col rounded-2xl px-2 pb-4 pt-2 text-left transition-[top,box-shadow,background-color] duration-300 ease-organic hover:-top-0.5 hover:bg-panel hover:shadow-[var(--shadow-warm)] focus-visible:bg-panel"
    >
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={assetUrl(item.imageUrl)}
          alt=""
          loading="lazy"
          decoding="async"
          width={512}
          height={512}
          className="illustration aspect-square w-full object-contain p-[4%] transition duration-500 ease-organic group-hover:scale-[1.03]"
        />
        {urgent && (
          <span className={`${presentation.className} absolute left-1 top-1 bg-page/70`}>
            {presentation.label}
          </span>
        )}

        <span
          aria-hidden
          className="absolute bottom-2 right-2 flex size-6 items-center justify-center rounded-full bg-invert text-on-invert opacity-0 transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <ArrowUpRight className="size-3.5" />
        </span>
      </div>

      <div className="flex flex-1 flex-col pt-2 text-center">
        {/* h4: the section heading is h2 and the type block above is h3. */}
        <h4 className="display hyphenate line-clamp-2 text-[1.05rem] leading-[1.15] text-ink-900">
          {localName}
        </h4>
        {showGerman && (
          <p className="mt-0.5 truncate text-[0.72rem] leading-tight text-ink-400">{item.nameDE}</p>
        )}
        {latin && (
          <p className="display mt-0.5 truncate text-[0.72rem] italic leading-tight text-ink-300">
            {latin}
          </p>
        )}
        <p className="display mt-auto truncate pt-2 text-[0.8rem] italic text-ink-400">
          {item.culinaryTag}
        </p>
      </div>
    </button>
  )
}
