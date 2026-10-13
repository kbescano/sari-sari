import { PackageX } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatPeso } from '@/lib/currency'

export interface StorefrontProduct {
  id: string
  title: string
  sellingPrice: number
  unitType: 'piece' | 'pack' | 'sachet'
  stockQuantity: number
  categorySlug: string
}

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const isOutOfStock = product.stockQuantity <= 0

  return (
    <Card className={`transition-all hover:-translate-y-0.5 hover:shadow-card-hover ${isOutOfStock ? 'opacity-50' : ''}`}>
      <p className="text-lg font-semibold text-slate-900">{product.title}</p>
      <p className="mt-1 text-xl font-bold text-primary-600">
        {formatPeso(product.sellingPrice)} <span className="text-base font-medium text-slate-400">/ {product.unitType}</span>
      </p>
      {isOutOfStock && (
        <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-danger-600">
          <PackageX size={14} /> Out of stock
        </p>
      )}
    </Card>
  )
}
