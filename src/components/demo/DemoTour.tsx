'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShoppingCart, Package, BarChart3, History, PartyPopper, ChevronRight, ChevronLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface TourStep {
  icon: typeof ShoppingCart
  title: string
  body: string
}

const BASE_STEPS: TourStep[] = [
  {
    icon: PartyPopper,
    title: 'Welcome to the demo!',
    body: "You're logged into a live, interactive sandbox. Click around just like a real cashier or owner would — a short tour of the main screens follows.",
  },
  {
    icon: ShoppingCart,
    title: 'Point of Sale',
    body: 'Tap products to build a bill, pick a payment method, and complete a sale. On mobile, switch between Products and Bill with the toggle up top.',
  },
  {
    icon: Package,
    title: 'Inventory',
    body: 'Browse Current Stock, Low Stock, and Best Seller tabs. Try adjusting stock or editing a product — demo accounts can see every control in action.',
  },
  {
    icon: BarChart3,
    title: 'Sales Report',
    body: 'Filter by day, week, month, or a custom range, and see Best Sellers broken down by category and by item × brand.',
  },
]

const ADMIN_STEP: TourStep = {
  icon: History,
  title: 'Activity Log',
  body: 'Owners get a full audit trail of every inventory change — who added, renamed, repriced, or hid a product, and when.',
}

export function DemoTour({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const steps = isAdmin ? [...BASE_STEPS, ADMIN_STEP] : BASE_STEPS

  useEffect(() => {
    const isFreshDemoLogin = searchParams.get('demo') === 'welcome'
    const alreadyShown = typeof window !== 'undefined' && sessionStorage.getItem('demo-tour-shown') === '1'

    if (isFreshDemoLogin && !alreadyShown) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true)
      sessionStorage.setItem('demo-tour-shown', '1')
      const params = new URLSearchParams(searchParams.toString())
      params.delete('demo')
      router.replace(params.size > 0 ? `/?${params.toString()}` : '/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const step = steps[stepIndex]
  if (!isOpen || !step) return null

  const isLastStep = stepIndex === steps.length - 1
  const Icon = step.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-card-hover">
        <div className="mb-4 flex items-start justify-between gap-2">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <Icon size={24} />
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Skip tour"
            className="flex h-touch-min w-touch-min shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        <h2 className="mb-1.5 text-lg font-bold text-slate-900">{step.title}</h2>
        <p className="mb-5 text-base text-slate-600">{step.body}</p>

        <div className="mb-4 flex items-center justify-center gap-1.5">
          {steps.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === stepIndex ? 'w-6 bg-primary-600' : 'w-1.5 bg-slate-200'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {stepIndex > 0 && (
            <Button type="button" variant="neutral" onClick={() => setStepIndex((i) => i - 1)}>
              <ChevronLeft size={18} />
              Back
            </Button>
          )}
          <Button
            type="button"
            className="flex-1"
            onClick={() => (isLastStep ? setIsOpen(false) : setStepIndex((i) => i + 1))}
          >
            {isLastStep ? "Let's go" : 'Next'}
            {!isLastStep && <ChevronRight size={18} />}
          </Button>
        </div>
      </div>
    </div>
  )
}
