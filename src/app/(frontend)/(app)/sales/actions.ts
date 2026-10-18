'use server'

import { revalidatePath } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'
import { assertNotDemo, requireAdmin } from '@/lib/auth'
import { logActivity } from '@/lib/activityLog'

// Voiding only ever touches Completed orders — the sale is reversed in place rather than
// deleted, so it stays in the database for audit purposes but drops out of every
// Completed-only query (Sales Report totals, best sellers, the transaction list itself).
export async function voidOrderAction(orderId: number) {
  const user = await requireAdmin()
  assertNotDemo(user)
  const payload = await getPayloadClient()

  const order = await payload.findByID({ collection: 'orders', id: orderId })

  if (order.status !== 'Completed') {
    throw new Error('Only a completed sale can be voided.')
  }

  const products = await Promise.all(
    (order.items ?? []).map((item) =>
      payload.findByID({
        collection: 'products',
        id: typeof item.product === 'object' ? item.product.id : item.product,
      }),
    ),
  )

  await Promise.all(
    products.map((product, index) =>
      payload.update({
        collection: 'products',
        id: product.id,
        data: { stockQuantity: product.stockQuantity + (order.items?.[index]?.quantity ?? 0) },
      }),
    ),
  )

  await payload.update({ collection: 'orders', id: orderId, data: { status: 'Cancelled' } })

  if (order.paymentMethod === 'Credit/Utang') {
    const { docs: debtEntries } = await payload.find({
      collection: 'debt-ledger',
      where: { order: { equals: orderId } },
      limit: 1,
    })
    if (debtEntries[0]) {
      await payload.delete({ collection: 'debt-ledger', id: debtEntries[0].id })
    }
  }

  await logActivity(
    payload,
    user.id,
    'void',
    `Voided sale ${order.orderNumber} (₱${order.totalAmount}) — stock restored for ${products.length} item${products.length === 1 ? '' : 's'}`,
  )

  revalidatePath('/sales')
  revalidatePath('/')
  revalidatePath('/inventory')
  revalidatePath('/logs')
}
