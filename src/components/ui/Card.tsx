import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      // Edge light (inset top highlight) sells a raised surface more than shadow alone —
      // real raised edges catch light; a shadow by itself just reads as a drop-cast.
      className={`rounded-2xl border border-slate-100 bg-white p-4 [box-shadow:inset_0_1px_0_0_rgb(255_255_255_/_0.8),0_1px_2px_0_rgb(15_23_42_/_0.03)] ${className}`}
    />
  )
}
