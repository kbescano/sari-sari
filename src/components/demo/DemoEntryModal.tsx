'use client'

import { useTransition } from 'react'
import { X, ShieldCheck, ShoppingCart, Package, BarChart3, History, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { demoLoginAction } from '@/app/(frontend)/login/actions'

const ROLE_COPY = {
  owner: {
    title: 'Try the Demo as Store Owner',
    blurb: 'Full access: ring up sales, manage inventory and pricing, view sales reports, and see the activity log.',
    features: [
      { icon: ShoppingCart, label: 'Ring up a sale at the POS' },
      { icon: Package, label: 'Edit products, prices, and stock' },
      { icon: BarChart3, label: 'View the Sales Report & best sellers' },
      { icon: History, label: 'Review the owner-only Activity Log' },
    ],
  },
  staff: {
    title: 'Try the Demo as Staff',
    blurb: 'A cashier’s view: ring up sales and add new products, without pricing or settings access.',
    features: [
      { icon: ShoppingCart, label: 'Ring up a sale at the POS' },
      { icon: Package, label: 'Add new products to inventory' },
      { icon: BarChart3, label: 'View the Sales Report' },
    ],
  },
} as const

export function DemoEntryModal({ role, onClose }: { role: 'owner' | 'staff'; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const copy = ROLE_COPY[role]

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card-hover"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <h2 className="text-xl font-extrabold leading-snug text-slate-900">{copy.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-touch-min w-touch-min shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <p className="mb-4 text-base text-slate-600">{copy.blurb}</p>

        <ul className="mb-4 space-y-2">
          {copy.features.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-base font-semibold text-slate-700">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon size={16} />
              </span>
              {label}
            </li>
          ))}
        </ul>

        <div className="mb-5 flex items-start gap-2 rounded-xl bg-success-50 px-3 py-2.5 text-sm font-semibold text-success-700">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" />
          <span>This is a shared sandbox. Nothing you do here is saved or affects a real store.</span>
        </div>

        <Button
          type="button"
          size="xl"
          className="w-full"
          disabled={isPending}
          onClick={() => startTransition(() => demoLoginAction(role))}
        >
          <Sparkles size={20} />
          {isPending ? 'Starting demo...' : `Enter Demo as ${role === 'owner' ? 'Owner' : 'Staff'}`}
        </Button>
      </div>
    </div>
  )
}
