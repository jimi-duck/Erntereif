/** A hand-drawn watercolour swash, laid under a word in the headline. */
export function BrushStroke({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 24"
      preserveAspectRatio="none"
      className={className}
      fill="none"
      aria-hidden
    >
      <path
        d="M3 14c22-7 52-9 88-8 38 1 70-3 108-2 34 1 67 3 98 1-3 3-2 6 0 8-34 2-72 2-108 1-40-1-74 2-112 3-26 1-50 0-70-3Z"
        fill="currentColor"
        fillOpacity=".5"
      />
      <path
        d="M12 15c40-5 84-4 130-3 44 1 92-1 142-3"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity=".55"
      />
    </svg>
  )
}
