import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={`rounded-3xl border border-slate-100 bg-white p-5 shadow-card ${className}`} />
  )
}
