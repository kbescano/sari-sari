import { BarChart3, TrendingUp, TrendingDown, ShoppingBag, Wallet, Layers, Tag, Download } from 'lucide-react'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser } from '@/lib/auth'
import { getDateRange, PERIOD_LABELS, type SalesPeriod } from '@/lib/dateRange'
import { Card } from '@/components/ui/Card'
import { PeriodFilter } from '@/components/sales/PeriodFilter'
import { BestSellerCard, type BestSellerRow } from '@/components/sales/BestSellerCard'
import { TransactionRow } from '@/components/sales/TransactionRow'
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

  const user = await getCurrentUser()
  const isAdmin = user?.role === 'owner'

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

  // Same period window as the orders query above — expenses use their own `spentAt` date
  // field rather than createdAt, since an expense can be backdated to when it was paid.
  const { docs: expenses } = await payload.find({
    collection: 'expenses',
    where: Object.keys(dateConstraints).length ? { spentAt: dateConstraints } : {},
    limit: 1000,
  })
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netIncome = netProfit - totalExpenses

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

  const exportParams = new URLSearchParams({ period })
  if (from) exportParams.set('from', from)
  if (to) exportParams.set('to', to)

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <BarChart3 size={20} className="text-primary-600" /> Sales Report
        </h1>
        <a
          href={`/api/sales/export?${exportParams.toString()}`}
          className="flex h-touch-min items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-base font-bold text-slate-700 shadow-card transition-[background-color,transform] duration-150 ease-[var(--ease-out-snap)] hover:bg-slate-50 active:scale-[0.97]"
        >
          <Download size={15} /> Export CSV
        </a>
      </div>

      <PeriodFilter activePeriod={period} from={from} to={to} />

      <p className="text-base text-slate-500">
        Showing: <span className="font-bold text-slate-700">{PERIOD_LABELS[period]}</span>
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-2 text-base font-bold text-slate-500">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success-50 text-success-700">
              <TrendingUp size={15} />
            </span>
            Total Sales
          </div>
          <p className="mt-3 text-2xl font-extrabold tabular-nums text-success-700">{formatPeso(totalSales)}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-base font-bold text-slate-500">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <ShoppingBag size={15} />
            </span>
            Number of Sales
          </div>
          <p className="mt-3 text-2xl font-extrabold tabular-nums text-slate-900">{orders.length}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-base font-bold text-slate-500">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
              <TrendingUp size={15} />
            </span>
            Gross Profit
          </div>
          <p className="mt-3 text-2xl font-extrabold tabular-nums text-primary-700">{formatPeso(netProfit)}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-base font-bold text-slate-500">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger-50 text-danger-600">
              <TrendingDown size={15} />
            </span>
            Expenses
          </div>
          <p className="mt-3 text-2xl font-extrabold tabular-nums text-danger-600">{formatPeso(totalExpenses)}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-base font-bold text-slate-500">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success-50 text-success-700">
              <TrendingUp size={15} />
            </span>
            Net Income
          </div>
          <p
            className={`mt-3 text-2xl font-extrabold tabular-nums ${netIncome < 0 ? 'text-danger-600' : 'text-success-700'}`}
          >
            {formatPeso(netIncome)}
          </p>
        </Card>

        {settings.isUtangEnabled && (
          <Card className="border-danger-200 bg-danger-50/40">
            <div className="flex items-center gap-2 text-base font-bold text-danger-700">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-danger-700">
                <Wallet size={15} />
              </span>
              Uncollected Credit (Utang)
            </div>
            <p className="mt-3 text-2xl font-extrabold tabular-nums text-danger-600">{formatPeso(uncollectedDebt)}</p>
          </Card>
        )}
      </div>

      <Card className="p-0">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-lg font-extrabold text-slate-900">Transactions</h2>
        </div>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <ShoppingBag size={18} />
            </span>
            <p className="text-lg font-semibold text-slate-500">No sales in this period.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {orders.map((order) => (
              <TransactionRow
                key={order.id}
                orderId={order.id}
                orderNumber={order.orderNumber}
                customerName={order.customerName}
                createdAt={order.createdAt}
                totalAmount={order.totalAmount}
                paymentMethod={order.paymentMethod}
                isAdmin={isAdmin}
              />
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
