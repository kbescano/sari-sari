'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Banknote, BookUser, Smartphone, Ban } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatPeso } from '@/lib/currency'
import { voidOrderAction } from '@/app/(frontend)/(app)/sales/actions'
import type { PaymentMethod } from '@/lib/store/usePosCart'

const PAYMENT_BADGE: Record<PaymentMethod, { icon: typeof Banknote; label: string; tone: 'neutral' | 'primary' | 'unpaid' }> = {
  Cash: { icon: Banknote, label: 'Cash', tone: 'neutral' },
  GCash: { icon: Smartphone, label: 'GCash', tone: 'primary' },
  'Credit/Utang': { icon: BookUser, label: 'Utang', tone: 'unpaid' },
}

export function TransactionRow({
  orderId,
  orderNumber,
  customerName,
  createdAt,
  totalAmount,
  paymentMethod,
  isAdmin,
}: {
  orderId: number
  orderNumber: string
  customerName: string
  createdAt: string
  totalAmount: number
  paymentMethod: PaymentMethod
  isAdmin: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { icon: Icon, label, tone } = PAYMENT_BADGE[paymentMethod]

  function handleVoid() {
    startTransition(async () => {
      try {
        await voidOrderAction(orderId)
        router.refresh()
      } catch (voidError) {
        setError(voidError instanceof Error ? voidError.message : 'Could not void this sale.')
        setIsConfirming(false)
      }
    })
  }

  return (
    <li className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-slate-900">{orderNumber}</p>
          <p className="truncate text-sm text-slate-500">
            {customerName} · {new Date(createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone={tone}>
            <Icon size={14} /> {label}
          </Badge>
          <p className="text-lg font-extrabold tabular-nums text-slate-900">{formatPeso(totalAmount)}</p>
        </div>
      </div>

      {isAdmin && (
        <div className="flex items-center justify-end gap-2">
          {error && <p className="mr-auto text-sm font-semibold text-danger-700">{error}</p>}
          {isConfirming ? (
            <>
              <span className="text-sm font-semibold text-slate-600">Void this sale?</span>
              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                className="h-touch-min rounded-lg px-3 text-sm font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleVoid}
                className="h-touch-min rounded-lg bg-danger-600 px-3 text-sm font-bold text-white transition-[background-color,transform] duration-150 ease-[var(--ease-out-snap)] hover:bg-danger-700 active:scale-[0.97] disabled:opacity-50"
              >
                {isPending ? 'Voiding...' : 'Confirm Void'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirming(true)}
              className="flex h-touch-min items-center gap-1.5 rounded-lg px-3 text-sm font-bold text-danger-600 hover:bg-danger-50"
            >
              <Ban size={14} /> Void Sale
            </button>
          )}
        </div>
      )}
    </li>
  )
}
