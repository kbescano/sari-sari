import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const fieldClasses =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 text-base font-medium text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`h-touch-min ${fieldClasses} ${className}`} />
}

export function Label({ className = '', ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={`mb-1 block text-sm font-semibold text-slate-500 ${className}`} />
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`h-touch-min ${fieldClasses} ${className}`} />
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`py-2.5 ${fieldClasses} ${className}`} />
}
