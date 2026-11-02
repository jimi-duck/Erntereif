/** A hand-drawn watercolour leaf: a wash of sage, an ink vein. */
export function Wordmark({ className = 'size-8' }: { className?: string }) {
  return (
    <span className={`flex shrink-0 items-center justify-center ${className}`} aria-hidden>
      <svg viewBox="0 0 32 32" className="size-full" fill="none">
        <path
          d="M6.5 25C4.5 14 11 5.5 25.5 5c.8 13-5.6 21.4-17.2 20.6"
          fill="#5f7a4a"
          fillOpacity=".78"
        />
        <path
          d="M8 24.5C10.5 16 16 11 24 7.5 17.5 12 13.2 17.6 11.4 25"
          stroke="#faf6ee"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeOpacity=".85"
        />
        <path
          d="M6.5 25C4.5 14 11 5.5 25.5 5"
          stroke="#48612f"
          strokeWidth=".9"
          strokeLinecap="round"
          strokeOpacity=".7"
        />
        <path d="M5 28c1.4-1.8 2.6-3.2 4-4.2" stroke="#1f2a22" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  )
}
