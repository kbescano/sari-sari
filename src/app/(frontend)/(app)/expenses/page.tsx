import { TrendingDown, Receipt } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { getDateRange, PERIOD_LABELS, type SalesPeriod } from '@/lib/dateRange'
import { Card } from '@/components/ui/Card'
import { PeriodFilter } from '@/components/sales/PeriodFilter'
import { AddExpenseForm } from '@/components/expenses/AddExpenseForm'
import { ExpenseRow } from '@/components/expenses/ExpenseRow'
import { formatPeso } from '@/lib/currency'

const VALID_PERIODS: SalesPeriod[] = ['day', 'week', 'month', 'year', 'all', 'range']

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>
}) {
  const { period: periodParam, from, to } = await searchParams
  const period: SalesPeriod = VALID_PERIODS.includes(periodParam as SalesPeriod) ? (periodParam as SalesPeriod) : 'month'
  const { start, end } = getDateRange(period, from, to)

  const user = await getCurrentUser()
  const isAdmin = user?.role === 'owner'

  const payload = await getPayloadClient()

  const dateConstraints: Record<string, string> = {}
  if (start) dateConstraints.greater_than_equal = start.toISOString()
  if (end) dateConstraints.less_than_equal = end.toISOString()

  const { docs: expenses } = await payload.find({
    collection: 'expenses',
    where: Object.keys(dateConstraints).length ? { spentAt: dateConstraints } : {},
    sort: '-spentAt',
    limit: 500,
    depth: 1,
  })

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const categoryTotals = new Map<string, number>()
  for (const expense of expenses) {
    categoryTotals.set(expense.category, (categoryTotals.get(expense.category) ?? 0) + expense.amount)
  }
  const topCategory = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1])[0]

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <TrendingDown size={20} className="text-primary-600" /> Expenses
        </h1>
        <AddExpenseForm />
      </div>

      <PeriodFilter activePeriod={period} from={from} to={to} />

      <p className="text-base text-slate-500">
        Showing: <span className="font-bold text-slate-700">{PERIOD_LABELS[period]}</span>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2 text-base font-bold text-slate-500">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger-50 text-danger-600">
              <TrendingDown size={15} />
            </span>
            Total Expenses
          </div>
          <p className="mt-3 text-2xl font-extrabold tabular-nums text-danger-600">{formatPeso(totalExpenses)}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-base font-bold text-slate-500">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Receipt size={15} />
            </span>
            Top Category
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{topCategory ? topCategory[0] : '—'}</p>
          {topCategory && <p className="text-base font-semibold text-slate-500">{formatPeso(topCategory[1])}</p>}
        </Card>
      </div>

      <Card className="p-0">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-lg font-extrabold text-slate-900">Expense Log</h2>
        </div>
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <TrendingDown size={18} />
            </span>
            <p className="text-lg font-semibold text-slate-500">No expenses logged in this period.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {expenses.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expenseId={expense.id}
                description={expense.description}
                amount={expense.amount}
                category={expense.category}
                spentAt={expense.spentAt}
                loggedByEmail={typeof expense.loggedBy === 'object' ? expense.loggedBy.email : 'Unknown user'}
                isAdmin={isAdmin}
              />
            ))}
          </ul>
        )}
      </Card>
    </main>
  )
}
