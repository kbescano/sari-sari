export type SalesPeriod = 'day' | 'week' | 'month' | 'year' | 'all' | 'range'

export interface DateRange {
  start: Date | null
  end: Date | null
}

function startOfDay(date: Date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function startOfWeek(date: Date) {
  const result = startOfDay(date)
  const day = result.getDay() // 0 = Sunday
  result.setDate(result.getDate() - day)
  return result
}

function startOfMonth(date: Date) {
  const result = startOfDay(date)
  result.setDate(1)
  return result
}

function startOfYear(date: Date) {
  const result = startOfDay(date)
  result.setMonth(0, 1)
  return result
}

export function getDateRange(period: SalesPeriod, from?: string | null, to?: string | null): DateRange {
  const now = new Date()

  switch (period) {
    case 'day':
      return { start: startOfDay(now), end: null }
    case 'week':
      return { start: startOfWeek(now), end: null }
    case 'month':
      return { start: startOfMonth(now), end: null }
    case 'year':
      return { start: startOfYear(now), end: null }
    case 'range': {
      const start = from ? startOfDay(new Date(from)) : null
      const end = to ? new Date(new Date(to).setHours(23, 59, 59, 999)) : null
      return { start, end }
    }
    case 'all':
    default:
      return { start: null, end: null }
  }
}

export const PERIOD_LABELS: Record<SalesPeriod, string> = {
  day: 'Today',
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
  all: 'All Time',
  range: 'Custom Range',
}
