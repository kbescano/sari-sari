'use server'

import { revalidatePath } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'
import { requireAdmin, requireUser } from '@/lib/auth'
import type { Payload } from 'payload'

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

async function logActivity(
  payload: Payload,
  userId: number,
  action: 'create' | 'pricing' | 'stock' | 'visibility',
  productId: number,
  summary: string,
) {
  await payload.create({
    collection: 'activity-logs',
    data: { user: userId, action, product: productId, summary },
  })
}

export async function createProductAction(
  _prevState: CreateProductState,
  formData: FormData,
): Promise<CreateProductState> {
  // Adding new products is open to staff, not just the owner — still fully logged below.
  const user = await requireUser()
  const payload = await getPayloadClient()

  const title = String(formData.get('title') ?? '').trim()
  const categoryId = Number(formData.get('category'))
  const costPrice = Number(formData.get('costPrice'))
  const markupType = String(formData.get('markupType') ?? 'percentage') as 'percentage' | 'fixed'
  const markupValue = Number(formData.get('markupValue') ?? 0)
  const unitType = String(formData.get('unitType') ?? 'piece') as 'piece' | 'pack' | 'sachet'
  const stockQuantity = Number(formData.get('stockQuantity') ?? 0)

  if (!title || !categoryId || Number.isNaN(costPrice)) {
    return { error: 'Please fill in the product name, category, and cost price.', success: false }
  }

  const product = await payload.create({
    collection: 'products',
    data: {
      title,
      slug: slugify(title),
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
    Number(user.id),
    'create',
    product.id,
    `Added "${title}" — cost ₱${costPrice}, ${formatMarkup(markupType, markupValue)} markup, starting stock ${stockQuantity}`,
  )

  revalidatePath('/inventory')
  revalidatePath('/pos')
  revalidatePath('/')
  revalidatePath('/logs')

  return { error: null, success: true }
}

export async function adjustStockAction(productId: number, delta: number) {
  const user = await requireAdmin()
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
    productId,
    `${delta > 0 ? '+' : ''}${delta} stock on "${product.title}" (${product.stockQuantity} → ${newQuantity})`,
  )

  revalidatePath('/inventory')
  revalidatePath('/pos')
  revalidatePath('/')
  revalidatePath('/logs')
}

export async function toggleProductActiveAction(productId: number, isActive: boolean) {
  const user = await requireAdmin()
  const payload = await getPayloadClient()

  const product = await payload.findByID({ collection: 'products', id: productId })
  await payload.update({ collection: 'products', id: productId, data: { isActive } })

  await logActivity(
    payload,
    user.id,
    'visibility',
    productId,
    `${isActive ? 'Showed' : 'Hid'} "${product.title}" ${isActive ? 'on' : 'from'} storefront and POS`,
  )

  revalidatePath('/inventory')
  revalidatePath('/pos')
  revalidatePath('/')
  revalidatePath('/logs')
}

export interface UpdatePricingState {
  error: string | null
  success: boolean
}

export async function updateProductPricingAction(
  _prevState: UpdatePricingState,
  formData: FormData,
): Promise<UpdatePricingState> {
  const user = await requireAdmin()
  const payload = await getPayloadClient()

  const productId = Number(formData.get('productId'))
  const costPrice = Number(formData.get('costPrice'))
  const markupType = String(formData.get('markupType') ?? 'percentage') as 'percentage' | 'fixed'
  const markupValue = Number(formData.get('markupValue') ?? 0)

  if (!productId || Number.isNaN(costPrice) || Number.isNaN(markupValue)) {
    return { error: 'Please enter a valid cost price and markup.', success: false }
  }

  const product = await payload.findByID({ collection: 'products', id: productId })

  await payload.update({
    collection: 'products',
    id: productId,
    // sellingPrice is recomputed server-side from costPrice + markup (see Products.ts hook).
    data: { costPrice, markupType, markupValue },
  })

  await logActivity(
    payload,
    user.id,
    'pricing',
    productId,
    `Updated pricing for "${product.title}" — cost ₱${product.costPrice} → ₱${costPrice}, markup ${formatMarkup(product.markupType, product.markupValue)} → ${formatMarkup(markupType, markupValue)}`,
  )

  revalidatePath('/inventory')
  revalidatePath('/pos')
  revalidatePath('/')
  revalidatePath('/logs')

  return { error: null, success: true }
}
