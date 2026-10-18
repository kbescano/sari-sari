import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'danger' | 'success' | 'neutral' | 'outline' | 'ghost'
type Size = 'lg' | 'xl' // no "sm" — every button here must clear the touch-min target

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800',
  success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-700',
  neutral: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50',
  outline: 'bg-transparent text-primary-600 border border-primary-500 hover:bg-primary-50',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
}

const sizeClasses: Record<Size, string> = {
  lg: 'h-touch-min px-4 text-sm',
  xl: 'h-touch-lg px-5 text-base',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'primary', size = 'lg', className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold tracking-tight transition-[background-color,box-shadow,transform] duration-150 ease-[var(--ease-out-snap)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    />
  )
}
