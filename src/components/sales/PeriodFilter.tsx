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

      <div className="flex w-full items-center gap-2 rounded-xl bg-slate-100 p-1 sm:w-auto">
        <Calendar size={18} className="ml-2 hidden shrink-0 text-slate-500 sm:block" />
        <input
          type="date"
          value={from ?? ''}
          onChange={(event) => setRange(event.target.value, to ?? '')}
          className="h-touch-min min-w-0 flex-1 rounded-lg bg-white px-2 text-base font-semibold text-slate-900 sm:flex-none"
          aria-label="From date"
        />
        <span className="shrink-0 text-slate-400">–</span>
        <input
          type="date"
          value={to ?? ''}
          onChange={(event) => setRange(from ?? '', event.target.value)}
          className="h-touch-min min-w-0 flex-1 rounded-lg bg-white px-2 text-base font-semibold text-slate-900 sm:flex-none"
          aria-label="To date"
        />
      </div>
    </div>
  )
}
