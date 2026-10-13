import { BarChart3, TrendingUp, ShoppingBag, Wallet } from 'lucide-react'
import { getPayloadClient } from '@/lib/payload'
import { getDateRange, PERIOD_LABELS, type SalesPeriod } from '@/lib/dateRange'
import { Card } from '@/components/ui/Card'
import { PeriodFilter } from '@/components/sales/PeriodFilter'
import { formatPeso } from '@/lib/currency'

const VALID_PERIODS: SalesPeriod[] = ['day', 'week', 'month', 'year', 'all', 'range']

export default async function SalesReportPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>
}) {
  const { period: periodParam, from, to } = await searchParams
  const period: SalesPeriod = VALID_PERIODS.includes(periodParam as SalesPeriod) ? (periodParam as SalesPeriod) : 'day'
  const { start, end } = getDateRange(period, from, to)

  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'store-settings' })

  const dateConstraints: Record<string, string> = {}
  if (start) dateConstraints.greater_than_equal = start.toISOString()
  if (end) dateConstraints.less_than_equal = end.toISOString()

  const { docs: orders } = await payload.find({
    collection: 'orders',
    where: {
      and: [
        { status: { equals: 'Completed' } },
        ...(Object.keys(dateConstraints).length ? [{ createdAt: dateConstraints }] : []),
      ],
    },
    limit: 1000,
  })

  const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0)

  // Each line's costPrice is a snapshot taken at the moment of sale (see pos/actions.ts),
  // so this is the real net profit for that sale — not an estimate based on current cost.
  const netProfit = orders.reduce((sum, order) => {
    const orderProfit = (order.items ?? []).reduce(
      (lineSum, item) => lineSum + (item.unitPrice - item.costPrice) * item.quantity,
      0,
    )
    return sum + orderProfit
  }, 0)

  let uncollectedDebt = 0
  if (settings.isUtangEnabled) {
    const { docs: unpaidEntries } = await payload.find({
      collection: 'debt-ledger',
      where: { isPaid: { equals: false } },
      limit: 500,
    })
    uncollectedDebt = unpaidEntries.reduce((sum, entry) => sum + entry.totalAmount, 0)
  }

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-4">
      <h1 className="flex items-center gap-2 text-3xl font-extrabold text-slate-900">
        <BarChart3 size={28} className="text-primary-600" /> Sales Report
      </h1>

      <PeriodFilter activePeriod={period} from={from} to={to} />

      <p className="text-base text-slate-500">
        Showing: <span className="font-bold text-slate-700">{PERIOD_LABELS[period]}</span>
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="flex items-center gap-2 text-base font-bold text-slate-500">
            <TrendingUp size={18} /> Total Sales
          </p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-success-700">{formatPeso(totalSales)}</p>
        </Card>

        <Card>
          <p className="flex items-center gap-2 text-base font-bold text-slate-500">
            <ShoppingBag size={18} /> Number of Sales
          </p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-slate-900">{orders.length}</p>
        </Card>

        <Card>
          <p className="flex items-center gap-2 text-base font-bold text-slate-500">
            <TrendingUp size={18} /> Net Profit
          </p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-primary-700">{formatPeso(netProfit)}</p>
        </Card>

        {settings.isUtangEnabled && (
          <Card className="border-danger-200 bg-danger-50/40">
            <p className="flex items-center gap-2 text-base font-bold text-danger-700">
              <Wallet size={18} /> Uncollected Credit (Utang)
            </p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums text-danger-600">{formatPeso(uncollectedDebt)}</p>
          </Card>
        )}
      </div>

      <Card className="p-0">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-lg font-extrabold text-slate-900">Transactions</h2>
        </div>
        {orders.length === 0 ? (
          <p className="py-8 text-center text-lg text-slate-500">No sales in this period.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {orders.map((order) => (
              <li key={order.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-bold text-slate-900">{order.orderNumber}</p>
                  <p className="text-sm text-slate-500">
                    {order.customerName} · {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="text-lg font-extrabold tabular-nums text-slate-900">{formatPeso(order.totalAmount)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </main>
  )
}
