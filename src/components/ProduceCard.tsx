import { assetUrl } from '@/lib/assets'
import { cn } from '@/lib/cn'
import { CATEGORY_LABEL, STATUS_PRESENTATION } from '@/lib/seasonality'
import type { ResolvedProduce } from '@/types/produce'

interface Props {
  resolved: ResolvedProduce
  onSelect: (id: string) => void
  /** Staggers the entrance animation across the grid. */
  index: number
}

export function ProduceCard({ resolved, onSelect, index }: Props) {
  const { item, status, localName } = resolved
  const showEnglish = localName !== item.nameEN
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
      <div className="relative overflow-hidden rounded-sm bg-surface">
        {/* Photographs are 256px originals, so they sit inside the tile at
            roughly native size rather than being scaled up to fill it. */}
        <img
          src={assetUrl(item.imageUrl)}
          alt=""
          loading="lazy"
          decoding="async"
          width={256}
          height={256}
          className="aspect-square w-full object-contain p-[14%] transition duration-500 ease-organic group-hover:scale-[1.06]"
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
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <h3 className="display text-[0.95rem] leading-tight text-ink-900 transition group-hover:text-neon-600">
          {localName}
        </h3>
        {showEnglish && (
          <p className="mt-0.5 text-[0.8rem] leading-snug text-ink-400">{item.nameEN}</p>
        )}
        <p className="label mt-auto pt-2.5 text-ink-300">
          {CATEGORY_LABEL[item.category]} · {item.culinaryTag}
        </p>
      </div>
    </button>
  )
}
