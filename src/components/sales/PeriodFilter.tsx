'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Calendar } from 'lucide-react'
import type { SalesPeriod } from '@/lib/dateRange'

const PERIOD_OPTIONS: { value: SalesPeriod; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'all', label: 'All Time' },
]

export function PeriodFilter({ activePeriod, from, to }: { activePeriod: SalesPeriod; from?: string; to?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setPeriod(period: SalesPeriod) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', period)
    if (period !== 'range') {
      params.delete('from')
      params.delete('to')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  function setRange(nextFrom: string, nextTo: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', 'range')
    if (nextFrom) params.set('from', nextFrom)
    if (nextTo) params.set('to', nextTo)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setPeriod(option.value)}
            className={`h-touch-min rounded-lg px-4 text-base font-bold transition-colors ${
              activePeriod === option.value ? 'bg-white text-primary-700 shadow-card' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-card sm:w-auto">
        <Calendar size={18} className="ml-1.5 hidden shrink-0 text-primary-600 sm:block" />
        <div className="flex min-w-0 flex-1 flex-col sm:flex-none">
          <span className="px-1 text-xs font-bold uppercase tracking-wide text-slate-400">From</span>
          <input
            type="date"
            value={from ?? ''}
            onChange={(event) => setRange(event.target.value, to ?? '')}
            className="h-9 min-w-0 flex-1 rounded-lg bg-slate-50 px-2 text-base font-semibold text-slate-900 accent-primary-600 outline-none transition-colors focus:bg-primary-50 sm:flex-none"
            aria-label="From date"
          />
        </div>
        <span className="mt-4 shrink-0 text-slate-300">–</span>
        <div className="flex min-w-0 flex-1 flex-col sm:flex-none">
          <span className="px-1 text-xs font-bold uppercase tracking-wide text-slate-400">To</span>
          <input
            type="date"
            value={to ?? ''}
            onChange={(event) => setRange(from ?? '', event.target.value)}
            className="h-9 min-w-0 flex-1 rounded-lg bg-slate-50 px-2 text-base font-semibold text-slate-900 accent-primary-600 outline-none transition-colors focus:bg-primary-50 sm:flex-none"
            aria-label="To date"
          />
        </div>
      </div>
    </div>
  )
}
