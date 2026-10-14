'use client'

import { useMemo, useState } from 'react'
import { PackageX } from 'lucide-react'
import { SearchBar } from '@/components/storefront/SearchBar'
import { CategoryChips, type Category } from '@/components/storefront/CategoryChips'
import { ProductListItem, type InventoryProduct } from './ProductListItem'

export function InventoryList({
  products,
  categories,
  lowStockThreshold,
  isAdmin,
}: {
  products: InventoryProduct[]
  categories: Category[]
  lowStockThreshold: number
  isAdmin: boolean
}) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === null || product.categorySlug === activeCategory
      const matchesQuery = product.title.toLowerCase().includes(query.trim().toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [products, activeCategory, query])

  const groups = useMemo(() => {
    const map = new Map<string, InventoryProduct[]>()
    for (const product of filteredProducts) {
      const list = map.get(product.categoryName) ?? []
      list.push(product)
      map.set(product.categoryName, list)
    }
    return map
  }, [filteredProducts])

  return (
    <div className="space-y-4">
      <SearchBar value={query} onChange={setQuery} />
      <CategoryChips categories={categories} activeSlug={activeCategory} onSelect={setActiveCategory} />

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <PackageX size={22} />
          </span>
          <p className="text-lg font-semibold text-slate-500">No products found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(groups.entries()).map(([categoryName, categoryProducts]) => (
            <section key={categoryName}>
              <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-400">{categoryName}</h2>
              <div className="rounded-3xl border border-slate-100 bg-white px-4 shadow-card">
                {categoryProducts.map((product) => (
                  <ProductListItem key={product.id} product={product} lowStockThreshold={lowStockThreshold} isAdmin={isAdmin} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
