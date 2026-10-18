'use client'

import { Banknote } from 'lucide-react'
import { usePosCart, selectCartTotal } from '@/lib/store/usePosCart'
import { formatPeso } from '@/lib/currency'

const QUICK_CASH_AMOUNTS = [50, 100, 200, 500, 1000]

export function SukliCalculator() {
  const total = usePosCart(selectCartTotal)
  const cashTendered = usePosCart((state) => state.cashTendered)
  const setCashTendered = usePosCart((state) => state.setCashTendered)
  const paymentMethod = usePosCart((state) => state.paymentMethod)

  if (paymentMethod === 'Credit/Utang') {
    return (
      <div className="rounded-xl bg-danger-50 p-4 text-center">
        <p className="text-sm font-semibold text-danger-700">No change due — recorded as Credit (Utang).</p>
      </div>
    )
  }

  if (paymentMethod === 'GCash') {
    return (
      <div className="rounded-xl bg-primary-50 p-4 text-center">
        <p className="text-sm font-semibold text-primary-700">No change due — paid via GCash.</p>
      </div>
    )
  }

  const change = cashTendered !== null ? cashTendered - total : null
  const isInsufficient = change !== null && change < 0

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-900" htmlFor="cash-tendered">
        <Banknote size={16} /> Cash Tendered
      </label>
      <input
        id="cash-tendered"
        type="number"
        min={0}
        inputMode="decimal"
        value={cashTendered ?? ''}
        onChange={(event) => setCashTendered(event.target.value === '' ? null : Number(event.target.value))}
        placeholder="0.00"
        className="h-touch-lg w-full rounded-xl border border-slate-300 px-3.5 text-lg font-semibold tabular-nums focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-500"
      />

      <div className="flex flex-wrap gap-2">
        {QUICK_CASH_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => setCashTendered(amount)}
            className="h-touch-min flex-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold hover:bg-primary-50"
          >
            ₱{amount}
          </button>
        ))}
      </div>

      <div
        className={`flex items-center justify-between rounded-xl p-4 ${
          isInsufficient ? 'bg-danger-50' : 'bg-success-50'
        }`}
      >
        <span className="text-sm font-semibold text-slate-900">Change:</span>
        <span className={`text-xl font-extrabold tabular-nums ${isInsufficient ? 'text-danger-700' : 'text-success-700'}`}>
          {change === null ? '—' : isInsufficient ? 'Insufficient cash' : formatPeso(change)}
        </span>
      </div>
    </div>
  )
}
