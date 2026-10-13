'use client'

import { useActionState, useEffect } from 'react'
import { X, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MarkupPricingFields, type MarkupType } from './MarkupPricingFields'
import {
  updateProductPricingAction,
  type UpdatePricingState,
} from '@/app/(frontend)/(app)/inventory/actions'

const initialState: UpdatePricingState = { error: null, success: false }

export function EditPricingModal({
  productId,
  title,
  costPrice,
  markupType,
  markupValue,
  onClose,
}: {
  productId: number
  title: string
  costPrice: number
  markupType: MarkupType
  markupValue: number
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(updateProductPricingAction, initialState)

  useEffect(() => {
    if (state.success) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-card-hover"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
            <Tag size={22} className="text-primary-600" /> Edit Pricing
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-touch-min w-touch-min items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-4 truncate text-base font-semibold text-slate-600">{title}</p>

        <form action={formAction} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="productId" value={productId} />
          <MarkupPricingFields defaultCostPrice={costPrice} defaultMarkupType={markupType} defaultMarkupValue={markupValue} />

          {state.error && (
            <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm font-semibold text-danger-700 sm:col-span-2">
              {state.error}
            </p>
          )}

          <Button type="submit" size="xl" className="sm:col-span-2" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Pricing'}
          </Button>
        </form>
      </div>
    </div>
  )
}
