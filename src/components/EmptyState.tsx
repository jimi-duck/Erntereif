import { SearchX } from 'lucide-react'

interface Props {
  title: string
  body: string
  onReset: () => void
}

export function EmptyState({ title, body, onReset }: Props) {
  return (
    <div className="animate-fade-up flex flex-col items-start rounded-sm bg-surface px-7 py-16">
      <span className="flex size-11 items-center justify-center rounded-sm bg-ink-900 text-neon-500">
        <SearchX className="size-5" aria-hidden />
      </span>
      <h2 className="display mt-5 max-w-md text-2xl leading-tight tracking-[-0.03em] text-ink-900">{title}</h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-500">{body}</p>
      <button
        type="button"
        onClick={onReset}
        className="label mt-7 rounded-sm bg-neon-500 px-5 py-3 text-ink-900 transition hover:bg-neon-600"
      >
        Clear filters
      </button>
    </div>
  )
}
