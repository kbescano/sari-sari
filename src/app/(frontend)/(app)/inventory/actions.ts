'use server'

import { revalidatePath } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'
import { assertNotDemo, DEMO_BLOCKED_MESSAGE, requireAdmin, requireUser } from '@/lib/auth'
import { logActivity } from '@/lib/activityLog'

export interface CreateProductState {
  error: string | null
  success: boolean
}

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + `-${Date.now().toString(36)}`
  )
}

function formatMarkup(markupType: 'percentage' | 'fixed', markupValue: number) {
  return markupType === 'fixed' ? `+₱${markupValue}` : `+${markupValue}%`
}

export async function createProductAction(
  _prevState: CreateProductState,
  formData: FormData,
): Promise<CreateProductState> {
  // Adding new products is open to staff, not just the owner — still fully logged below.
  const user = await requireUser()
  if (user.isDemo) return { error: DEMO_BLOCKED_MESSAGE, success: false }
  const payload = await getPayloadClient()

  const title = String(formData.get('title') ?? '').trim()
  const brand = String(formData.get('brand') ?? '').trim()
  const categoryId = Number(formData.get('category'))
  const costPrice = Number(formData.get('costPrice'))
  const markupType = String(formData.get('markupType') ?? 'percentage') as 'percentage' | 'fixed'
  const markupValue = Number(formData.get('markupValue') ?? 0)
  const unitType = String(formData.get('unitType') ?? 'piece') as 'piece' | 'pack' | 'sachet'
  const stockQuantity = Number(formData.get('stockQuantity') ?? 0)
  const barcode = String(formData.get('barcode') ?? '').trim()

  if (!title || !brand || !categoryId || Number.isNaN(costPrice)) {
    return { error: 'Please fill in the product name, brand, category, and cost price.', success: false }
  }

  const product = await payload.create({
    collection: 'products',
    data: {
      title,
      itemName: title,
      brand,
      slug: slugify(title),
      barcode: barcode || undefined,
      category: categoryId,
      costPrice,
      markupType,
      markupValue: Number.isNaN(markupValue) ? 0 : markupValue,
      // sellingPrice is computed server-side from costPrice + markup (see Products.ts hook).
      sellingPrice: costPrice,
      unitType,
      stockQuantity: Number.isNaN(stockQuantity) ? 0 : stockQuantity,
      isActive: true,
    },
  })

  await logActivity(
    payload,
    user.id,
    'create',
    `Added "${title}" — cost ₱${costPrice}, ${formatMarkup(markupType, markupValue)} markup, starting stock ${stockQuantity}`,
    product.id,
  )

  revalidatePath('/inventory')
  revalidatePath('/')
  revalidatePath('/logs')

  return { error: null, success: true }
}

export async function adjustStockAction(productId: number, delta: number) {
  const user = await requireAdmin()
  assertNotDemo(user)
  const payload = await getPayloadClient()

  const product = await payload.findByID({ collection: 'products', id: productId })
  const newQuantity = Math.max(0, product.stockQuantity + delta)
  await payload.update({
    collection: 'products',
    id: productId,
    data: { stockQuantity: newQuantity },
  })

  await logActivity(
    payload,
    user.id,
    'stock',
    `${delta > 0 ? '+' : ''}${delta} stock on "${product.title}" (${product.stockQuantity} → ${newQuantity})`,
    product.id,
  )

  revalidatePath('/inventory')
  revalidatePath('/')
  revalidatePath('/logs')
}

export async function toggleProductActiveAction(productId: number, isActive: boolean) {
  const user = await requireAdmin()
  assertNotDemo(user)
  const payload = await getPayloadClient()

  const product = await payload.findByID({ collection: 'products', id: productId })
  await payload.update({ collection: 'products', id: productId, data: { isActive } })

  await logActivity(
    payload,
    user.id,
    'visibility',
    `${isActive ? 'Showed' : 'Hid'} "${product.title}" ${isActive ? 'on' : 'from'} storefront and POS`,
    product.id,
  )

  revalidatePath('/inventory')
  revalidatePath('/')
  revalidatePath('/logs')
}

export interface UpdateProductState {
  error: string | null
  success: boolean
}

export async function updateProductAction(
  _prevState: UpdateProductState,
  formData: FormData,
): Promise<UpdateProductState> {
  const user = await requireAdmin()
  if (user.isDemo) return { error: DEMO_BLOCKED_MESSAGE, success: false }
  const payload = await getPayloadClient()

  const productId = Number(formData.get('productId'))
  const title = String(formData.get('title') ?? '').trim()
  const costPrice = Number(formData.get('costPrice'))
  const markupType = String(formData.get('markupType') ?? 'percentage') as 'percentage' | 'fixed'
  const markupValue = Number(formData.get('markupValue') ?? 0)
  const barcode = String(formData.get('barcode') ?? '').trim()

  if (!productId || !title || Number.isNaN(costPrice) || Number.isNaN(markupValue)) {
    return { error: 'Please enter a product name, a valid cost price, and markup.', success: false }
  }

  const product = await payload.findByID({ collection: 'products', id: productId })

  await payload.update({
    collection: 'products',
    id: productId,
    // sellingPrice is recomputed server-side from costPrice + markup (see Products.ts hook).
    data: { title, costPrice, markupType, markupValue, barcode: barcode || null },
  })

  if (title !== product.title) {
    await logActivity(payload, user.id, 'rename', `Renamed "${product.title}" to "${title}"`, product.id)
  }

  if (costPrice !== product.costPrice || markupType !== product.markupType || markupValue !== product.markupValue) {
    await logActivity(
      payload,
      user.id,
      'pricing',
      `Updated pricing for "${title}" — cost ₱${product.costPrice} → ₱${costPrice}, markup ${formatMarkup(product.markupType, product.markupValue)} → ${formatMarkup(markupType, markupValue)}`,
      product.id,
    )
  }

  revalidatePath('/inventory')
  revalidatePath('/')
  revalidatePath('/logs')

  return { error: null, success: true }
}
