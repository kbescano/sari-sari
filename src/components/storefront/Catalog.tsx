'use client'

import { useMemo, useState } from 'react'
import { SearchBar } from './SearchBar'
import { CategoryChips, type Category } from './CategoryChips'
import { ProductCard, type StorefrontProduct } from './ProductCard'

export function Catalog({ products, categories }: { products: StorefrontProduct[]; categories: Category[] }) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === null || product.categorySlug === activeCategory
      const matchesQuery = product.title.toLowerCase().includes(query.trim().toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [products, activeCategory, query])

  return (
    <div className="space-y-4">
      <SearchBar value={query} onChange={setQuery} />
      <CategoryChips categories={categories} activeSlug={activeCategory} onSelect={setActiveCategory} />

      {filteredProducts.length === 0 ? (
        <p className="py-12 text-center text-lg text-slate-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
