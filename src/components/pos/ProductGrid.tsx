'use client'

import { PackageX } from 'lucide-react'
import { usePosCart } from '@/lib/store/usePosCart'
import { formatPeso } from '@/lib/currency'

export interface PosProduct {
  id: string
  title: string
  itemName: string
  brand: string
  sellingPrice: number
  unitType: 'piece' | 'pack' | 'sachet'
  stockQuantity: number
  categoryName: string
  barcode: string
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
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <PackageX size={22} />
        </span>
        <p className="text-lg font-semibold text-slate-500">No products found.</p>
      </div>
    )
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
                  className="flex min-h-touch-lg min-w-0 flex-col items-start justify-center gap-1.5 rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-card transition-[transform,box-shadow] duration-150 ease-[var(--ease-out-snap)] hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0 disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
                >
                  {product.brand && (
                    <span className="inline-block rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700">
                      {product.brand}
                    </span>
                  )}
                  <span className="w-full break-words text-sm font-semibold leading-snug text-slate-900">{product.itemName}</span>
                  <span className="text-sm font-semibold text-primary-700">
                    {formatPeso(product.sellingPrice)} / {product.unitType}
                  </span>
                  {isOutOfStock && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-danger-600">
                      <PackageX size={12} /> Out of stock
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
