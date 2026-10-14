import { Package, CheckCircle2 } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { AddProductForm } from '@/components/inventory/AddProductForm'
import { InventoryList } from '@/components/inventory/InventoryList'
import { InventoryTabs, type InventoryTab } from '@/components/inventory/InventoryTabs'
import { BestSellersList, type BestSellerItem } from '@/components/inventory/BestSellersList'

const VALID_TABS: InventoryTab[] = ['stock', 'low', 'best']

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab: tabParam } = await searchParams
  const activeTab: InventoryTab = VALID_TABS.includes(tabParam as InventoryTab) ? (tabParam as InventoryTab) : 'stock'

  const user = await getCurrentUser()
  const isAdmin = user?.role === 'owner'

  const payload = await getPayloadClient()

  const [{ docs: products }, { docs: categories }, settings] = await Promise.all([
    payload.find({ collection: 'products', sort: 'title', limit: 500, depth: 1 }),
    payload.find({ collection: 'categories', sort: 'displayOrder', limit: 100 }),
    payload.findGlobal({ slug: 'store-settings' }),
  ])

  const lowStockThreshold = settings.lowStockThreshold ?? 5

  const inventoryProducts = products.map((product) => {
    const category = typeof product.category === 'object' ? product.category : null
    return {
      id: product.id,
      title: product.title,
      itemName: product.itemName,
      brand: product.brand,
      categoryName: category?.name ?? 'Uncategorized',
      categorySlug: category?.slug ?? '',
      costPrice: product.costPrice,
      markupType: product.markupType,
      markupValue: product.markupValue,
      sellingPrice: product.sellingPrice,
      unitType: product.unitType,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive ?? true,
    }
  })

  const lowStockProducts = inventoryProducts.filter((product) => product.stockQuantity <= lowStockThreshold)

  let bestSellers: BestSellerItem[] = []
  if (activeTab === 'best') {
    const { docs: orders } = await payload.find({
      collection: 'orders',
      where: { status: { equals: 'Completed' } },
      limit: 1000,
    })

    const totalsByProductId = new Map<number, { unitsSold: number; revenue: number }>()
    for (const order of orders) {
      for (const item of order.items ?? []) {
        const productId = typeof item.product === 'object' ? item.product.id : item.product
        const existing = totalsByProductId.get(productId) ?? { unitsSold: 0, revenue: 0 }
        existing.unitsSold += item.quantity
        existing.revenue += item.unitPrice * item.quantity
        totalsByProductId.set(productId, existing)
      }
    }

    const productById = new Map(inventoryProducts.map((product) => [product.id, product]))

    bestSellers = Array.from(totalsByProductId.entries())
      .map(([productId, totals]) => {
        const product = productById.get(productId)
        return {
          id: productId,
          title: product?.title ?? 'Unknown product',
          categoryName: product?.categoryName ?? 'Uncategorized',
          stockQuantity: product?.stockQuantity ?? 0,
          ...totals,
        }
      })
      .sort((a, b) => b.unitsSold - a.unitsSold)
  }

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-3xl font-extrabold text-slate-900">
          <Package size={28} className="text-primary-600" /> Inventory
        </h1>
        {activeTab === 'stock' && (
          <AddProductForm categories={categories.map((category) => ({ id: category.id, name: category.name }))} />
        )}
      </div>

      {!isAdmin && (
        <p className="rounded-xl bg-slate-100 px-4 py-2 text-base text-slate-600">
          You can add new products. Ask the store owner to change pricing or stock on existing ones.
        </p>
      )}

      <InventoryTabs activeTab={activeTab} lowStockCount={lowStockProducts.length} />

      {activeTab === 'stock' && (
        <InventoryList
          categories={categories.map((category) => ({ slug: category.slug, name: category.name }))}
          lowStockThreshold={lowStockThreshold}
          products={inventoryProducts}
          isAdmin={isAdmin}
        />
      )}

      {activeTab === 'low' && (
        <>
          {lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success-50 text-success-600">
                <CheckCircle2 size={22} />
              </span>
              <p className="text-lg font-semibold text-slate-500">
                Nothing low on stock — every product is above {lowStockThreshold} units.
              </p>
            </div>
          ) : (
            <InventoryList
              categories={categories.map((category) => ({ slug: category.slug, name: category.name }))}
              lowStockThreshold={lowStockThreshold}
              products={lowStockProducts}
              isAdmin={isAdmin}
            />
          )}
        </>
      )}

      {activeTab === 'best' && <BestSellersList items={bestSellers} />}
    </main>
  )
}
