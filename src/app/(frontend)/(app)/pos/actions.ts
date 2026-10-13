'use server'

import { revalidatePath } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'
import { requireUser } from '@/lib/auth'
import type { PaymentMethod } from '@/lib/store/usePosCart'

interface CreatePosOrderInput {
  items: { productId: string; quantity: number; unitPrice: number }[]
  totalAmount: number
  paymentMethod: PaymentMethod
  customerName: string
  customerPhone: string
}

export async function createPosOrder(input: CreatePosOrderInput) {
  await requireUser()
  const payload = await getPayloadClient()

  const settings = await payload.findGlobal({ slug: 'store-settings' })
  if (input.paymentMethod === 'Credit/Utang' && !settings.isUtangEnabled) {
    throw new Error('Utang is disabled for this store.')
  }

  // Fetch each product once up front: its current costPrice is snapshotted onto the order
  // line (so later edits to cost/markup never change past sales' recorded profit), and its
  // current stockQuantity is used for the deduction below.
  const products = await Promise.all(
    input.items.map((item) => payload.findByID({ collection: 'products', id: Number(item.productId) })),
  )

  const orderNumber = `SS-${Date.now().toString(36).toUpperCase()}`

  const order = await payload.create({
    collection: 'orders',
    data: {
      orderNumber,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      orderType: 'In-Store',
      items: input.items.map((item, index) => ({
        product: Number(item.productId),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        costPrice: products[index]!.costPrice,
      })),
      totalAmount: input.totalAmount,
      paymentMethod: input.paymentMethod,
      status: 'Completed',
    },
  })

  // Deduct stock for each line item.
  await Promise.all(
    input.items.map((item, index) =>
      payload.update({
        collection: 'products',
        id: Number(item.productId),
        data: { stockQuantity: Math.max(0, products[index]!.stockQuantity - item.quantity) },
      }),
    ),
  )

  if (input.paymentMethod === 'Credit/Utang') {
    await payload.create({
      collection: 'debt-ledger',
      data: {
        customerName: input.customerName,
        phone: input.customerPhone,
        order: order.id,
        totalAmount: input.totalAmount,
        isPaid: false,
      },
    })
  }

  revalidatePath('/pos')
  revalidatePath('/sales')
  revalidatePath('/inventory')

  return order
}
