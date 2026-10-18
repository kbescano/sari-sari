'use client'

import { Banknote, BookUser, Smartphone } from 'lucide-react'
import { usePosCart, type PaymentMethod } from '@/lib/store/usePosCart'
import { useIsUtangEnabled } from '@/lib/store/useStoreSettings'

export function PaymentMethodSelector() {
  const paymentMethod = usePosCart((state) => state.paymentMethod)
  const setPaymentMethod = usePosCart((state) => state.setPaymentMethod)
  const isUtangEnabled = useIsUtangEnabled()

  const options: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
    { value: 'Cash', label: 'Cash', icon: Banknote },
    { value: 'GCash', label: 'GCash', icon: Smartphone },
    ...(isUtangEnabled ? [{ value: 'Credit/Utang' as PaymentMethod, label: 'Credit (Utang)', icon: BookUser }] : []),
  ]

  return (
    <div className={`grid gap-3 ${options.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {options.map(({ value, label, icon: Icon }) => {
        const isSelected = paymentMethod === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => setPaymentMethod(value)}
            className={`flex h-touch-lg items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition-colors ${
              isSelected
                ? 'bg-primary-600 text-white shadow-card'
                : 'border border-slate-200 bg-white text-slate-900 hover:bg-primary-50'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
