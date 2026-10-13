import { getPayload } from 'payload'
import config from '../src/payload.config'

const TODAY = new Date('2026-10-13T23:59:59')
const MONTH_START = new Date('2026-10-01T00:00:00')

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + `-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  )
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDateThisMonth() {
  const dayOfMonth = randomInt(1, 13) // Oct 1 - Oct 13, inclusive (today)
  const hour = randomInt(7, 20) // store hours
  const minute = randomInt(0, 59)
  return new Date(2026, 9, dayOfMonth, hour, minute, randomInt(0, 59))
}

const NEW_PRODUCTS = [
  { title: 'Coffee 3-in-1 Sachet', category: 'drinks', costPrice: 6, markupType: 'fixed' as const, markupValue: 3, unitType: 'sachet' as const, stockQuantity: 80, addedBy: 'owner' as const },
  { title: 'Ice Candy (Pack of 10)', category: 'snacks', costPrice: 15, markupType: 'fixed' as const, markupValue: 10, unitType: 'pack' as const, stockQuantity: 25, addedBy: 'staff' as const },
  { title: 'Eggs (tray)', category: 'cooking-essentials', costPrice: 150, markupType: 'percentage' as const, markupValue: 15, unitType: 'piece' as const, stockQuantity: 10, addedBy: 'owner' as const },
  { title: 'Garlic (per 100g)', category: 'cooking-essentials', costPrice: 10, markupType: 'percentage' as const, markupValue: 30, unitType: 'piece' as const, stockQuantity: 40, addedBy: 'staff' as const },
  { title: 'Candles', category: 'toiletries', costPrice: 8, markupType: 'fixed' as const, markupValue: 7, unitType: 'piece' as const, stockQuantity: 36, addedBy: 'owner' as const },
]

async function main() {
  const payload = await getPayload({ config })

  // --- Persistent test users (kept, not cleaned up) ---
  async function ensureUser(email: string, role: 'owner' | 'staff') {
    const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
    if (existing.docs[0]) {
      console.log(`User exists: ${email}`)
      return existing.docs[0]
    }
    const user = await payload.create({
      collection: 'users',
      data: { email, password: 'TestSariSari123', role },
    })
    console.log(`Created user: ${email} (${role})`)
    return user
  }

  const owner = await ensureUser('owner@sarisari.com', 'owner')
  const staff = await ensureUser('staff@sarisari.com', 'staff')

  // --- Add new products, logged as if added via the Inventory UI ---
  const { docs: categories } = await payload.find({ collection: 'categories', limit: 100 })
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]))

  for (const spec of NEW_PRODUCTS) {
    const { docs: existing } = await payload.find({
      collection: 'products',
      where: { title: { equals: spec.title } },
      limit: 1,
    })
    if (existing[0]) {
      console.log(`Product exists, skipping: ${spec.title}`)
      continue
    }

    const categoryId = categoryIdBySlug.get(spec.category)
    if (!categoryId) throw new Error(`Missing category: ${spec.category}`)

    const product = await payload.create({
      collection: 'products',
      data: {
        title: spec.title,
        slug: slugify(spec.title),
        category: categoryId,
        costPrice: spec.costPrice,
        markupType: spec.markupType,
        markupValue: spec.markupValue,
        sellingPrice: spec.costPrice, // recomputed by the Products beforeValidate hook
        unitType: spec.unitType,
        stockQuantity: spec.stockQuantity,
        isActive: true,
      },
    })

    const actor = spec.addedBy === 'owner' ? owner : staff
    const markupLabel = spec.markupType === 'fixed' ? `+₱${spec.markupValue}` : `+${spec.markupValue}%`
    await payload.create({
      collection: 'activity-logs',
      data: {
        user: actor.id,
        action: 'create',
        product: product.id,
        summary: `Added "${spec.title}" — cost ₱${spec.costPrice}, ${markupLabel} markup, starting stock ${spec.stockQuantity}`,
      },
    })
    console.log(`Created product: ${spec.title} (added by ${actor.email})`)
  }

  // --- Generate sales from the 1st of the month through today ---
  const { docs: allProducts } = await payload.find({ collection: 'products', where: { isActive: { equals: true } }, limit: 500 })
  const stockById = new Map(allProducts.map((p) => [p.id, p.stockQuantity]))

  const ORDER_COUNT = 34
  let created = 0

  for (let i = 0; i < ORDER_COUNT; i++) {
    const orderDate = randomDateThisMonth()
    const lineCount = randomInt(1, 4)
    const chosenProducts = [...allProducts].sort(() => Math.random() - 0.5).slice(0, lineCount)

    const items = []
    let totalAmount = 0

    for (const product of chosenProducts) {
      const available = stockById.get(product.id) ?? 0
      if (available <= 0) continue
      const quantity = Math.min(randomInt(1, 5), available)
      if (quantity <= 0) continue

      items.push({
        product: product.id,
        quantity,
        unitPrice: product.sellingPrice,
        costPrice: product.costPrice,
      })
      totalAmount += product.sellingPrice * quantity
      stockById.set(product.id, available - quantity)
    }

    if (items.length === 0) continue

    const orderNumber = `SS-${orderDate.getTime().toString(36).toUpperCase()}-${i}`
    await payload.create({
      collection: 'orders',
      data: {
        orderNumber,
        customerName: 'Walk-in Customer',
        customerPhone: 'N/A',
        orderType: 'In-Store',
        items,
        totalAmount,
        paymentMethod: 'Cash',
        status: 'Completed',
        createdAt: orderDate.toISOString(),
      },
    })
    created++
  }

  console.log(`Created ${created} test orders from ${MONTH_START.toDateString()} to ${TODAY.toDateString()}`)

  // Apply the stock deductions computed above.
  for (const [productId, newQuantity] of stockById.entries()) {
    await payload.update({ collection: 'products', id: productId, data: { stockQuantity: newQuantity } })
  }
  console.log('Applied stock deductions for all test sales.')

  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
