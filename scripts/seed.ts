import { getPayload } from 'payload'
import config from '../src/payload.config'

const categoriesData = [
  { name: 'Drinks', slug: 'drinks', displayOrder: 1 },
  { name: 'Snacks', slug: 'snacks', displayOrder: 2 },
  { name: 'Canned Goods', slug: 'canned-goods', displayOrder: 3 },
  { name: 'Cooking Essentials', slug: 'cooking-essentials', displayOrder: 4 },
  { name: 'Toiletries', slug: 'toiletries', displayOrder: 5 },
]

const productsData = [
  { title: 'Instant Noodles', category: 'snacks', costPrice: 9, sellingPrice: 13, unitType: 'piece', stockQuantity: 48 },
  { title: 'Canned Sardines', category: 'canned-goods', costPrice: 18, sellingPrice: 25, unitType: 'piece', stockQuantity: 36 },
  { title: 'Bottled Water (500ml)', category: 'drinks', costPrice: 8, sellingPrice: 15, unitType: 'piece', stockQuantity: 60 },
  { title: 'Soft Drink (Cola)', category: 'drinks', costPrice: 14, sellingPrice: 20, unitType: 'piece', stockQuantity: 40 },
  { title: 'Potato Chips', category: 'snacks', costPrice: 20, sellingPrice: 28, unitType: 'pack', stockQuantity: 24 },
  { title: 'Biscuits', category: 'snacks', costPrice: 10, sellingPrice: 15, unitType: 'pack', stockQuantity: 30 },
  { title: 'Cooking Oil (1L)', category: 'cooking-essentials', costPrice: 70, sellingPrice: 85, unitType: 'piece', stockQuantity: 15 },
  { title: 'Rice (1kg)', category: 'cooking-essentials', costPrice: 48, sellingPrice: 58, unitType: 'piece', stockQuantity: 50 },
  { title: 'Soy Sauce', category: 'cooking-essentials', costPrice: 12, sellingPrice: 18, unitType: 'piece', stockQuantity: 20 },
  { title: 'Laundry Soap Bar', category: 'toiletries', costPrice: 15, sellingPrice: 22, unitType: 'piece', stockQuantity: 32 },
  { title: 'Shampoo Sachet', category: 'toiletries', costPrice: 5, sellingPrice: 8, unitType: 'sachet', stockQuantity: 100 },
  { title: 'Toothpaste', category: 'toiletries', costPrice: 25, sellingPrice: 35, unitType: 'piece', stockQuantity: 18 },
] as const

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function main() {
  const payload = await getPayload({ config })

  const categoryIdBySlug: Record<string, number> = {}

  for (const data of categoriesData) {
    const { docs } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: data.slug } },
      limit: 1,
    })
    const doc = docs[0] ?? (await payload.create({ collection: 'categories', data }))
    categoryIdBySlug[data.slug] = Number(doc.id)
    console.log(docs[0] ? `Category exists: ${data.name}` : `Created category: ${data.name}`)
  }

  for (const product of productsData) {
    const { docs } = await payload.find({
      collection: 'products',
      where: { title: { equals: product.title } },
      limit: 1,
    })
    if (docs[0]) {
      console.log(`Product exists, skipping: ${product.title}`)
      continue
    }

    const categoryId = categoryIdBySlug[product.category]
    if (!categoryId) throw new Error(`Missing category for product: ${product.title}`)

    await payload.create({
      collection: 'products',
      data: {
        title: product.title,
        slug: slugify(product.title),
        category: categoryId,
        costPrice: product.costPrice,
        markupType: 'fixed',
        markupValue: product.sellingPrice - product.costPrice,
        // sellingPrice is recomputed server-side from costPrice + markup (see Products.ts hook).
        sellingPrice: product.costPrice,
        unitType: product.unitType,
        stockQuantity: product.stockQuantity,
        isActive: true,
      },
      draft: false,
    })
    console.log(`Created product: ${product.title}`)
  }

  console.log('Seed complete.')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
