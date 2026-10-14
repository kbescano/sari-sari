import { Trophy } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatPeso } from '@/lib/currency'

export interface BestSellerItem {
  id: number
  title: string
  categoryName: string
  unitsSold: number
  revenue: number
  stockQuantity: number
}

const RANK_COLORS = ['text-warning-500', 'text-slate-400', 'text-orange-700']

export function BestSellersList({ items }: { items: BestSellerItem[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning-50 text-warning-500">
            <Trophy size={22} />
          </span>
          <p className="text-lg font-semibold text-slate-500">No completed sales yet.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-0">
      <ul className="divide-y divide-slate-100">
        {items.map((item, index) => (
          <li key={item.id} className="flex items-center gap-4 px-4 py-3">
            <div className="flex w-8 shrink-0 items-center justify-center">
              {index < 3 ? (
                <Trophy size={22} className={RANK_COLORS[index]} />
              ) : (
                <span className="text-lg font-extrabold text-slate-300">{index + 1}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="break-words text-lg font-bold text-slate-900">{item.title}</p>
              <p className="text-base text-slate-500">
                {item.categoryName} · {item.stockQuantity <= 0 ? <Badge tone="unpaid">Out of stock</Badge> : `${item.stockQuantity} in stock`}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-lg font-extrabold tabular-nums text-slate-900">{item.unitsSold} sold</p>
              <p className="text-base font-semibold tabular-nums text-success-700">{formatPeso(item.revenue)}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
