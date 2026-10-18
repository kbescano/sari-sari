'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { TrendingDown, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'
import { createExpenseAction, type CreateExpenseState } from '@/app/(frontend)/(app)/expenses/actions'

const initialState: CreateExpenseState = { error: null, success: false }

const CATEGORIES = [
  { value: 'Restock', label: 'Restock / Inventory' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Rent', label: 'Rent' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Supplies', label: 'Supplies' },
  { value: 'Other', label: 'Other' },
]

function todayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

export function AddExpenseForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createExpenseAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(false)
    }
  }, [state.success])

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <TrendingDown size={16} />
        Log Expense
      </Button>
    )
  }

  return (
    <Card className="border-primary-200">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <TrendingDown size={16} className="text-primary-600" /> Log Expense
        </h2>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close"
          className="flex h-touch-min w-touch-min items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
        >
          <X size={16} />
        </button>
      </div>

      <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" required placeholder="e.g. Restocked soft drinks" />
        </div>

        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" name="amount" type="number" min={0} step="0.01" required placeholder="0.00" />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select id="category" name="category" defaultValue="Restock">
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="spentAt">Date</Label>
          <Input id="spentAt" name="spentAt" type="date" defaultValue={todayInputValue()} required />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea id="notes" name="notes" rows={2} placeholder="Any extra detail..." />
        </div>

        {state.error && (
          <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm font-semibold text-danger-700 sm:col-span-2">
            {state.error}
          </p>
        )}

        <Button type="submit" size="xl" className="sm:col-span-2" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Expense'}
        </Button>
      </form>
    </Card>
  )
}
