'use client'

import { Sparkles, LogOut } from 'lucide-react'
import { logoutAction } from '@/app/(frontend)/(app)/actions'

export function DemoBanner() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-primary-600 px-4 py-2 text-center text-sm font-bold text-white sm:text-base">
      <span className="flex items-center gap-1.5">
        <Sparkles size={16} />
        Demo Mode — browse freely, nothing you do here is saved.
      </span>
      <form action={logoutAction}>
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-sm font-bold hover:bg-white/25"
        >
          <LogOut size={14} />
          Exit Demo
        </button>
      </form>
    </div>
  )
}
