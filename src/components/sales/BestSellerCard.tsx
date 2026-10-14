import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatPeso } from '@/lib/currency'

const RANK_COLORS = ['text-warning-500', 'text-slate-400', 'text-orange-700']

export interface BestSellerRow {
  key: string
  label: string
  sublabel?: string
  unitsSold: number
  revenue: number
}

export function BestSellerCard({
  title,
  icon: Icon,
  rows,
  emptyLabel,
}: {
  title: string
  icon: LucideIcon
  rows: BestSellerRow[]
  emptyLabel: string
}) {
  return (
    <Card className="p-0">
      <div className="border-b border-slate-100 p-4">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
          <Icon size={20} className="text-primary-600" /> {title}
        </h2>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Icon size={22} />
          </span>
          <p className="text-lg font-semibold text-slate-500">{emptyLabel}</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <li key={row.key} className="flex items-center gap-4 px-4 py-3">
              <div className="flex w-8 shrink-0 items-center justify-center">
                {index < 3 ? (
                  <Icon size={20} className={RANK_COLORS[index]} />
                ) : (
                  <span className="text-lg font-extrabold text-slate-300">{index + 1}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold text-slate-900">{row.label}</p>
                {row.sublabel && <p className="text-sm text-slate-500">{row.sublabel}</p>}
              </div>

              <div className="shrink-0 text-right">
                <p className="text-base font-extrabold tabular-nums text-slate-900">{row.unitsSold} sold</p>
                <p className="text-sm font-semibold tabular-nums text-success-700">{formatPeso(row.revenue)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
