import { assetUrl } from '@/lib/assets'

/**
 * The watercolour apple. On the paper it multiplies into the page; on a dark
 * block pass `plate` to seat it on its own cream disc instead.
 */
export function Wordmark({ className = 'size-9', plate = false }: { className?: string; plate?: boolean }) {
  return (
    <img
      src={assetUrl('/logo.png')}
      alt=""
      width={128}
      height={128}
      className={`shrink-0 object-contain ${plate ? 'rounded-full bg-[#fdfaed] p-0.5' : 'illustration'} ${className}`}
      aria-hidden
    />
  )
}
