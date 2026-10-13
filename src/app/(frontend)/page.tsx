import Link from 'next/link'
import { Store, LogIn } from 'lucide-react'
import { getPayloadClient } from '@/lib/payload'
import { Catalog } from '@/components/storefront/Catalog'

export default async function StorefrontPage() {
  const payload = await getPayloadClient()

  const [{ docs: products }, { docs: categories }, settings] = await Promise.all([
    payload.find({ collection: 'products', where: { isActive: { equals: true } }, sort: 'title', limit: 200 }),
    payload.find({ collection: 'categories', sort: 'displayOrder', limit: 100 }),
    payload.findGlobal({ slug: 'store-settings' }),
  ])

  const categoryById = new Map(categories.map((category) => [category.id, category]))

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 py-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white">
              <Store size={18} />
            </div>
            <span className="min-w-0 flex-1 text-base font-bold leading-tight tracking-tight text-slate-900 sm:whitespace-nowrap sm:text-lg">
              {settings.storeName}
            </span>
          </div>
          <Link
            href="/login"
            className="flex h-touch-min shrink-0 items-center gap-2 rounded-2xl px-4 text-base font-semibold text-slate-600 hover:bg-primary-50 hover:text-primary-700"
          >
            <LogIn size={18} />
            <span className="hidden sm:inline">Store Owner Login</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 p-4">
        <Catalog
          categories={categories.map((category) => ({ slug: category.slug, name: category.name }))}
          products={products.map((product) => {
            const category =
              typeof product.category === 'object' ? product.category : categoryById.get(product.category)
            return {
              id: String(product.id),
              title: product.title,
              sellingPrice: product.sellingPrice,
              unitType: product.unitType,
              stockQuantity: product.stockQuantity,
              categorySlug: category?.slug ?? '',
            }
          })}
        />
      </main>
    </div>
  )
}
