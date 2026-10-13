import type { ReactNode } from 'react'

type BadgeTone = 'paid' | 'unpaid' | 'warning' | 'neutral' | 'primary'

const toneClasses: Record<BadgeTone, string> = {
  paid: 'bg-success-50 text-success-700',
  unpaid: 'bg-danger-50 text-danger-700',
  warning: 'bg-warning-50 text-warning-600',
  neutral: 'bg-slate-100 text-slate-700',
  primary: 'bg-primary-50 text-primary-700',
}

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  )
}
