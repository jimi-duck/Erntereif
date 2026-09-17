import { ArrowUpRight } from 'lucide-react'
import { assetUrl } from '@/lib/assets'
import { cn } from '@/lib/cn'
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
  // badge the two statuses that carry urgency the heading cannot.
  const urgent = status === 'starting' || status === 'ending'
  const presentation = STATUS_PRESENTATION[status]

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      style={{ animationDelay: `${Math.min(index, 14) * 24}ms` }}
      className="group animate-fade-up flex flex-col text-left"
    >
      <div className="relative overflow-hidden rounded-sm bg-plate">
        {/* Photographs are 256px originals, so they sit inside the tile at
            roughly native size rather than being scaled up to fill it. */}
        <img
          src={assetUrl(item.imageUrl)}
          alt=""
          loading="lazy"
          decoding="async"
          width={256}
          height={256}
          className="aspect-square w-full object-contain p-[12%] transition duration-500 ease-organic group-hover:scale-[1.06]"
        />
        {urgent && (
          <span
            className={cn(
              'label absolute left-2 top-2 rounded-sm px-1.5 py-1',
              presentation.className,
            )}
          >
            {presentation.label}
          </span>
        )}

        {/* The eye lands bottom-right after scanning a tile, so that is where
            the way in goes. Hidden until the card is hovered or focused —
            eighty-seven permanent arrows would be noise, not signal. */}
        <span
          aria-hidden
          className="absolute bottom-2 right-2 flex size-6 items-center justify-center rounded-full bg-invert text-on-invert opacity-0 transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <ArrowUpRight className="size-3.5" />
        </span>
      </div>

      {/* Three things and no more: the picture, the name, and what to do with
          it. Every line is capped, because one crop with a long name or a long
          tag would otherwise set the row height for all six. */}
      <div className="flex flex-1 flex-col pt-2.5">
        {/* h4: the section heading is h2 and the type block above this card is
            h3, so a card name sits one level below that. */}
        <h4 className="display hyphenate line-clamp-2 text-[0.8rem] leading-[1.15] text-ink-900 transition group-hover:text-neon-600">
          {localName}
        </h4>
        {showGerman && (
          <p className="mt-0.5 truncate text-[0.72rem] leading-tight text-ink-400">{item.nameDE}</p>
        )}
        <p className="label mt-auto truncate pt-2 text-ink-300">{item.culinaryTag}</p>
      </div>
    </button>
  )
}
