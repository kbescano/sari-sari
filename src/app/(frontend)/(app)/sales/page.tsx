import { BarChart3, TrendingUp, ShoppingBag, Wallet, Layers, Tag } from 'lucide-react'
import { getPayloadClient } from '@/lib/payload'
import { getDateRange, PERIOD_LABELS, type SalesPeriod } from '@/lib/dateRange'
import { Card } from '@/components/ui/Card'
import { PeriodFilter } from '@/components/sales/PeriodFilter'
import { BestSellerCard, type BestSellerRow } from '@/components/sales/BestSellerCard'
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
    depth: 2, // resolve items[].product and, through it, product.category for the best-seller breakdowns below
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

  // Best sellers by category and by item×brand, computed from the same period-filtered orders
  // above — product/category come pre-resolved via depth:2 rather than a separate query.
  const categoryTotals = new Map<string, { label: string; unitsSold: number; revenue: number }>()
  const itemBrandTotals = new Map<string, { label: string; sublabel: string; unitsSold: number; revenue: number }>()

  for (const order of orders) {
    for (const item of order.items ?? []) {
      if (typeof item.product !== 'object' || item.product === null) continue
      const product = item.product
      const revenue = item.unitPrice * item.quantity

      const category = typeof product.category === 'object' ? product.category : null
      const categoryKey = category ? String(category.id) : 'uncategorized'
      const categoryLabel = category?.name ?? 'Uncategorized'
      const categoryEntry = categoryTotals.get(categoryKey) ?? { label: categoryLabel, unitsSold: 0, revenue: 0 }
      categoryEntry.unitsSold += item.quantity
      categoryEntry.revenue += revenue
      categoryTotals.set(categoryKey, categoryEntry)

      const itemName = product.itemName || product.title
      const brand = product.brand || 'Unbranded'
      const itemBrandKey = `${itemName}__${brand}`
      const itemBrandEntry = itemBrandTotals.get(itemBrandKey) ?? {
        label: itemName,
        sublabel: brand,
        unitsSold: 0,
        revenue: 0,
      }
      itemBrandEntry.unitsSold += item.quantity
      itemBrandEntry.revenue += revenue
      itemBrandTotals.set(itemBrandKey, itemBrandEntry)
    }
  }

  const categoryBestSellers: BestSellerRow[] = Array.from(categoryTotals.entries())
    .map(([key, value]) => ({ key, label: value.label, unitsSold: value.unitsSold, revenue: value.revenue }))
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 10)

  const itemBrandBestSellers: BestSellerRow[] = Array.from(itemBrandTotals.entries())
    .map(([key, value]) => ({
      key,
      label: value.label,
      sublabel: value.sublabel,
      unitsSold: value.unitsSold,
      revenue: value.revenue,
    }))
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 10)

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
          <div className="flex items-center gap-2 text-base font-bold text-slate-500">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success-50 text-success-700">
              <TrendingUp size={18} />
            </span>
            Total Sales
          </div>
          <p className="mt-3 text-4xl font-extrabold tabular-nums text-success-700">{formatPeso(totalSales)}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-base font-bold text-slate-500">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <ShoppingBag size={18} />
            </span>
            Number of Sales
          </div>
          <p className="mt-3 text-4xl font-extrabold tabular-nums text-slate-900">{orders.length}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-base font-bold text-slate-500">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
              <TrendingUp size={18} />
            </span>
            Net Profit
          </div>
          <p className="mt-3 text-4xl font-extrabold tabular-nums text-primary-700">{formatPeso(netProfit)}</p>
        </Card>

        {settings.isUtangEnabled && (
          <Card className="border-danger-200 bg-danger-50/40">
            <div className="flex items-center gap-2 text-base font-bold text-danger-700">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-danger-700">
                <Wallet size={18} />
              </span>
              Uncollected Credit (Utang)
            </div>
            <p className="mt-3 text-4xl font-extrabold tabular-nums text-danger-600">{formatPeso(uncollectedDebt)}</p>
          </Card>
        )}
      </div>

      <Card className="p-0">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-lg font-extrabold text-slate-900">Transactions</h2>
        </div>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ShoppingBag size={22} />
            </span>
            <p className="text-lg font-semibold text-slate-500">No sales in this period.</p>
          </div>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <BestSellerCard
          title="Best Seller by Category"
          icon={Layers}
          rows={categoryBestSellers}
          emptyLabel="No sales in this period."
        />
        <BestSellerCard
          title="Best Seller by Item × Brand"
          icon={Tag}
          rows={itemBrandBestSellers}
          emptyLabel="No sales in this period."
        />
      </div>
    </main>
  )
}
