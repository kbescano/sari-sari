import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes } from 'react'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-touch-min w-full rounded-2xl border-0 bg-slate-100 px-4 text-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
    />
  )
}

export function Label({ className = '', ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={`mb-1.5 block text-base font-semibold text-slate-600 ${className}`} />
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-touch-min w-full rounded-2xl border-0 bg-slate-100 px-4 text-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
    />
  )
}
