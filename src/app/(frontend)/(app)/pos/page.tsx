import { getPayloadClient } from '@/lib/payload'
import { CashierCounter } from '@/components/pos/CashierCounter'

export default async function PosPage() {
  const payload = await getPayloadClient()

  const [{ docs: products }, { docs: categories }] = await Promise.all([
    payload.find({
      collection: 'products',
      where: { isActive: { equals: true } },
      sort: 'title',
      limit: 200,
      depth: 1,
    }),
    payload.find({ collection: 'categories', sort: 'displayOrder', limit: 100 }),
  ])

  const categoryOrder = new Map(categories.map((category, index) => [category.id, index]))

  const sortedProducts = [...products].sort((a, b) => {
    const categoryA = typeof a.category === 'object' ? a.category.id : a.category
    const categoryB = typeof b.category === 'object' ? b.category.id : b.category
    const orderA = categoryOrder.get(categoryA) ?? 999
    const orderB = categoryOrder.get(categoryB) ?? 999
    return orderA - orderB || a.title.localeCompare(b.title)
  })

  return (
    <main className="mx-auto max-w-6xl p-4">
      <h1 className="mb-4 text-3xl font-extrabold text-slate-900">Point of Sale</h1>
      <CashierCounter
        products={sortedProducts.map((product) => ({
          id: String(product.id),
          title: product.title,
          sellingPrice: product.sellingPrice,
          unitType: product.unitType,
          stockQuantity: product.stockQuantity,
          categoryName: typeof product.category === 'object' ? product.category.name : 'Uncategorized',
        }))}
      />
    </main>
  )
}
