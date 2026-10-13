'use client'

import { useState, useTransition } from 'react'
import { AlertTriangle, Eye, EyeOff, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { adjustStockAction, toggleProductActiveAction } from '@/app/(frontend)/(app)/inventory/actions'
import { formatPeso } from '@/lib/currency'
import { EditPricingModal } from './EditPricingModal'
import type { MarkupType } from './MarkupPricingFields'

export interface InventoryProduct {
  id: number
  title: string
  categoryName: string
  categorySlug: string
  costPrice: number
  markupType: MarkupType
  markupValue: number
  sellingPrice: number
  unitType: 'piece' | 'pack' | 'sachet'
  stockQuantity: number
  isActive: boolean
}

const QUICK_ADJUST = [1, 5, 10]

export function ProductListItem({
  product,
  lowStockThreshold,
  isAdmin,
}: {
  product: InventoryProduct
  lowStockThreshold: number
  isAdmin: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= lowStockThreshold
  const isOutOfStock = product.stockQuantity <= 0

  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="break-words text-lg font-bold text-slate-900">{product.title}</p>
            {isOutOfStock && <Badge tone="unpaid">Out of stock</Badge>}
            {isLowStock && (
              <Badge tone="warning">
                <AlertTriangle size={14} /> {product.stockQuantity} left
              </Badge>
            )}
            {!product.isActive && <Badge tone="neutral">Hidden</Badge>}
          </div>
          <p className="text-base text-slate-500">
            {product.categoryName} · {formatPeso(product.sellingPrice)} / {product.unitType}{' '}
            {isAdmin && <span className="text-slate-400">(cost {formatPeso(product.costPrice)})</span>}
          </p>
        </div>

        {isAdmin && (
          <>
            <button
              type="button"
              onClick={() => setIsEditingPrice(true)}
              aria-label="Edit cost and markup"
              className="flex h-touch-min w-touch-min shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-primary-50 hover:text-primary-600"
            >
              <Tag size={20} />
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => toggleProductActiveAction(product.id, !product.isActive))}
              aria-label={product.isActive ? 'Hide from storefront and POS' : 'Show on storefront and POS'}
              className="flex h-touch-min w-touch-min shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 disabled:opacity-50 sm:hidden"
            >
              {product.isActive ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="w-10 shrink-0 text-center text-xl font-extrabold tabular-nums text-slate-900">
          {product.stockQuantity}
        </span>
        {isAdmin && (
          <>
            {QUICK_ADJUST.map((amount) => (
              <button
                key={amount}
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => adjustStockAction(product.id, amount))}
                className="h-touch-min shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 text-base font-bold text-success-700 hover:bg-success-50 disabled:opacity-50"
              >
                +{amount}
              </button>
            ))}
            <button
              type="button"
              disabled={isPending || product.stockQuantity <= 0}
              onClick={() => startTransition(() => adjustStockAction(product.id, -1))}
              className="h-touch-min shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 text-base font-bold text-danger-600 hover:bg-danger-50 disabled:opacity-50"
            >
              -1
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => toggleProductActiveAction(product.id, !product.isActive))}
              className="hidden h-touch-min shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 text-base font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 sm:block"
            >
              {product.isActive ? 'Hide' : 'Show'}
            </button>
          </>
        )}
      </div>

      {isEditingPrice && isAdmin && (
        <EditPricingModal
          productId={product.id}
          title={product.title}
          costPrice={product.costPrice}
          markupType={product.markupType}
          markupValue={product.markupValue}
          onClose={() => setIsEditingPrice(false)}
        />
      )}
    </div>
  )
}
