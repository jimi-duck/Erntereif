/** A sprig, cut to two inks like the illustrations. */
export function Wordmark({ className = 'size-8' }: { className?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-sm bg-neon-500 ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" className="size-[70%]" fill="none">
        <path d="M16 26V13" stroke="#0f2a1e" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M16 18s-4.5.6-7-2-2-7-2-7 4.5-.6 7 2 2 7 2 7Z" fill="#0f2a1e" />
        <path d="M16 15s4.5.6 7-2 2-7 2-7-4.5-.6-7 2-2 7-2 7Z" fill="#0f2a1e" />
      </svg>
    </span>
  )
}
