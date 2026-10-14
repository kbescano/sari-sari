'use client'

import { useState } from 'react'
import { ShoppingCart, UserCog } from 'lucide-react'
import { DemoEntryModal } from './DemoEntryModal'

export function DemoLoginSection() {
  const [openRole, setOpenRole] = useState<'owner' | 'staff' | null>(null)

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-sm font-bold uppercase tracking-wide text-slate-400">Or try it now</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setOpenRole('owner')}
          className="flex min-h-touch-min flex-col items-center justify-center gap-1.5 rounded-2xl border border-primary-200 bg-white py-3 text-primary-700 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0"
        >
          <UserCog size={22} />
          <span className="text-base font-bold">Demo as Owner</span>
        </button>
        <button
          type="button"
          onClick={() => setOpenRole('staff')}
          className="flex min-h-touch-min flex-col items-center justify-center gap-1.5 rounded-2xl border border-primary-200 bg-white py-3 text-primary-700 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0"
        >
          <ShoppingCart size={22} />
          <span className="text-base font-bold">Demo as Staff</span>
        </button>
      </div>

      {openRole && <DemoEntryModal role={openRole} onClose={() => setOpenRole(null)} />}
    </div>
  )
}
