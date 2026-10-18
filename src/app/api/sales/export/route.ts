import { NextResponse, type NextRequest } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { requireUser } from '@/lib/auth'
import { getDateRange, type SalesPeriod } from '@/lib/dateRange'

const VALID_PERIODS: SalesPeriod[] = ['day', 'week', 'month', 'year', 'all', 'range']

// Wraps a field in quotes only when it needs it, doubling any embedded quotes — the
// minimum escaping a CSV reader (Excel, Google Sheets) requires to round-trip safely.
function csvField(value: string | number): string {
  const text = String(value)
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export async function GET(request: NextRequest) {
  // requireUser() redirects on no-session, which isn't right for an API route — treat a
  // missing session as a plain 401 instead of letting it try to navigate this fetch.
  try {
    await requireUser()
  } catch {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const periodParam = searchParams.get('period') ?? 'all'
  const period: SalesPeriod = VALID_PERIODS.includes(periodParam as SalesPeriod) ? (periodParam as SalesPeriod) : 'all'
  const from = searchParams.get('from') ?? undefined
  const to = searchParams.get('to') ?? undefined
  const { start, end } = getDateRange(period, from, to)

  const payload = await getPayloadClient()

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
    sort: 'createdAt',
    limit: 5000,
    depth: 1,
  })

  const header = [
    'Order Number',
    'Date',
    'Customer Name',
    'Payment Method',
    'Items',
    'Total Amount',
    'Cost',
    'Profit',
  ]

  const rows = orders.map((order) => {
    const items = (order.items ?? [])
      .map((item) => `${typeof item.product === 'object' ? item.product.title : 'Product'} x${item.quantity}`)
      .join('; ')
    const cost = (order.items ?? []).reduce((sum, item) => sum + item.costPrice * item.quantity, 0)
    const profit = order.totalAmount - cost

    return [
      order.orderNumber,
      new Date(order.createdAt).toLocaleString('en-PH'),
      order.customerName,
      order.paymentMethod,
      items,
      order.totalAmount.toFixed(2),
      cost.toFixed(2),
      profit.toFixed(2),
    ]
  })

  const csv = [header, ...rows].map((row) => row.map(csvField).join(',')).join('\r\n')

  const filename = `sales-${period}-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
