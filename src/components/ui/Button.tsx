import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'danger' | 'success' | 'neutral' | 'outline' | 'ghost'
type Size = 'lg' | 'xl' // no "sm" — every button here must clear the 48px touch target

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-card',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 shadow-card',
  success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-700 shadow-card',
  neutral: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-card',
  outline: 'bg-transparent text-primary-600 border-2 border-primary-500 hover:bg-primary-50',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
}

const sizeClasses: Record<Size, string> = {
  lg: 'h-touch-min px-5 text-lg',
  xl: 'h-touch-lg px-6 text-xl',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'primary', size = 'lg', className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold tracking-tight transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    />
  )
}
