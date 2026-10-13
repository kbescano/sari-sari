'use client'

import { PackageX } from 'lucide-react'
import { usePosCart } from '@/lib/store/usePosCart'
import { formatPeso } from '@/lib/currency'

export interface PosProduct {
  id: string
  title: string
  sellingPrice: number
  unitType: 'piece' | 'pack' | 'sachet'
  stockQuantity: number
  categoryName: string
}

export function ProductGrid({
  products,
  onAddToCart,
}: {
  products: PosProduct[]
  onAddToCart?: (rect: DOMRect) => void
}) {
  const addLine = usePosCart((state) => state.addLine)

  if (products.length === 0) {
    return <p className="py-12 text-center text-lg text-slate-500">No products found.</p>
  }

  const groups = new Map<string, PosProduct[]>()
  for (const product of products) {
    const list = groups.get(product.categoryName) ?? []
    list.push(product)
    groups.set(product.categoryName, list)
  }

  return (
    <div className="space-y-6">
      {Array.from(groups.entries()).map(([categoryName, categoryProducts]) => (
        <section key={categoryName}>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">{categoryName}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categoryProducts.map((product) => {
              const isOutOfStock = product.stockQuantity <= 0
              return (
                <button
                  key={product.id}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={(event) => {
                    addLine({
                      productId: product.id,
                      title: product.title,
                      unitPrice: product.sellingPrice,
                      unitType: product.unitType,
                    })
                    onAddToCart?.(event.currentTarget.getBoundingClientRect())
                  }}
                  className="flex min-h-touch-lg min-w-0 flex-col items-start justify-center gap-0.5 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0 disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
                >
                  <span className="w-full break-words text-lg font-bold leading-tight text-slate-900">{product.title}</span>
                  <span className="text-base font-semibold text-primary-700">
                    {formatPeso(product.sellingPrice)} / {product.unitType}
                  </span>
                  {isOutOfStock && (
                    <span className="mt-0.5 flex items-center gap-1 text-sm font-bold text-danger-600">
                      <PackageX size={14} /> Out of stock
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
