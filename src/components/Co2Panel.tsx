import { Car, Leaf, Plane, Ship, Truck, Warehouse } from 'lucide-react'
import { compareCo2, formatCarKm, formatKg } from '@/lib/co2'
import type { Co2Profile, ImportMode } from '@/types/produce'

const MODE_ICON: Record<ImportMode, typeof Plane> = {
  air: Plane,
  sea: Ship,
  road: Truck,
  greenhouse: Warehouse,
}

export function Co2Panel({ co2 }: { co2: Co2Profile }) {
  const { saving, savingPercent, carKm, modeLabel } = compareCo2(co2)
  const ModeIcon = MODE_ICON[co2.importMode]
  const scale = (value: number) => `${Math.max((value / co2.imported) * 100, 4)}%`

  return (
    <section className="rounded-sm bg-block p-5 text-white">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="label text-white/65">Klimabilanz</h3>
        <span className="label rounded-sm bg-neon-500 px-2 py-1 text-on-accent">
          {savingPercent}% weniger
        </span>
      </div>

      <p className="display mt-5 text-[2.5rem] leading-none tracking-[-0.04em] text-white">
        {formatKg(saving)}
        <span className="ml-2.5 align-middle text-sm font-semibold tracking-normal text-white/65">CO₂e gespart pro kg</span>
      </p>

      <dl className="mt-5 space-y-3.5">
        <div>
          <dt className="label flex items-center gap-1.5 text-white/60">
            <Leaf className="size-3.5 text-neon-500" aria-hidden /> Von hier, in Saison
          </dt>
          <dd className="mt-1.5 flex items-center gap-2">
            <span
              className="h-2 rounded-sm bg-neon-500 transition-[width] duration-700 ease-organic"
              style={{ width: scale(co2.local) }}
            />
            <span className="label shrink-0 tabular-nums">{formatKg(co2.local)}</span>
          </dd>
        </div>
        <div>
          <dt className="label flex items-center gap-1.5 text-white/60">
            <ModeIcon className="size-3.5 text-coral-500" aria-hidden /> {co2.origin}, {modeLabel}
          </dt>
          <dd className="mt-1.5 flex items-center gap-2">
            <span
              className="h-2 rounded-sm bg-coral-500 transition-[width] duration-700 ease-organic"
              style={{ width: scale(co2.imported) }}
            />
            <span className="label shrink-0 tabular-nums">{formatKg(co2.imported)}</span>
          </dd>
        </div>
      </dl>

      <p className="mt-5 flex items-start gap-2 border-t border-white/15 pt-4 text-xs leading-relaxed text-white/70">
        <Car className="mt-0.5 size-3.5 shrink-0 text-white/55" aria-hidden />
        <span>
          Ein Kilo von hier zu kaufen spart so viel, wie{' '}
          <strong className="font-bold text-white">{formatCarKm(carKm)}</strong> nicht zu fahren.
          Richtwerte zum Vergleichen, keine echte CO₂-Bilanz.
        </span>
      </p>
    </section>
  )
}
