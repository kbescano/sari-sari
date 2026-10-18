import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Store, ArrowLeft } from 'lucide-react'
import { requireUser } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { formatPeso } from '@/lib/currency'
import { PrintButton } from '@/components/receipt/PrintButton'

export default async function ReceiptPage({ params }: { params: Promise<{ orderId: string }> }) {
  await requireUser()
  const { orderId } = await params
  const payload = await getPayloadClient()

  const [order, settings] = await Promise.all([
    payload
      .findByID({ collection: 'orders', id: Number(orderId), depth: 1 })
      .catch(() => null),
    payload.findGlobal({ slug: 'store-settings' }),
  ])

  if (!order) notFound()

  return (
    <main className="mx-auto min-h-screen max-w-sm space-y-4 bg-slate-50 p-4 print:bg-white print:p-0">
      <Link
        href="/"
        className="no-print flex items-center gap-2 text-base font-bold text-slate-600 hover:text-primary-700"
      >
        <ArrowLeft size={18} /> Back to POS
      </Link>

      <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-card print:rounded-none print:border-0 print:shadow-none">
        <div className="flex flex-col items-center gap-1 border-b border-dashed border-slate-300 pb-4 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-600 text-white">
            <Store size={20} />
          </span>
          <p className="text-lg font-extrabold text-slate-900">{settings.storeName}</p>
          <p className="text-sm font-semibold text-slate-500">Official Receipt</p>
        </div>

        <div className="space-y-1 border-b border-dashed border-slate-300 pb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Order #</span>
            <span className="font-bold text-slate-900">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date</span>
            <span className="font-semibold text-slate-700">{new Date(order.createdAt).toLocaleString('en-PH')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Customer</span>
            <span className="font-semibold text-slate-700">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment</span>
            <span className="font-semibold text-slate-700">{order.paymentMethod}</span>
          </div>
        </div>

        <ul className="space-y-2 border-b border-dashed border-slate-300 pb-4 text-sm">
          {(order.items ?? []).map((item, index) => {
            const title = typeof item.product === 'object' && item.product ? item.product.title : 'Product'
            return (
              <li key={index} className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{title}</p>
                  <p className="text-slate-500">
                    {formatPeso(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <p className="font-bold tabular-nums text-slate-900">{formatPeso(item.unitPrice * item.quantity)}</p>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center justify-between">
          <span className="text-lg font-extrabold text-slate-900">Total</span>
          <span className="text-2xl font-extrabold tabular-nums text-slate-900">{formatPeso(order.totalAmount)}</span>
        </div>

        <p className="pt-2 text-center text-xs font-semibold text-slate-400">Thank you for shopping with us!</p>
      </div>

      <PrintButton />
    </main>
  )
}
