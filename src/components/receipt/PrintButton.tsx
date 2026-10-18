'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print flex h-touch-lg w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 text-xl font-bold text-white shadow-card transition-[background-color,transform] duration-150 ease-[var(--ease-out-snap)] hover:bg-primary-700 active:scale-[0.97]"
    >
      <Printer size={22} />
      Print Receipt
    </button>
  )
}
