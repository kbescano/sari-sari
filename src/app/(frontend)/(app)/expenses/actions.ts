'use server'

import { revalidatePath } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'
import { assertNotDemo, DEMO_BLOCKED_MESSAGE, requireAdmin, requireUser } from '@/lib/auth'
import { logActivity } from '@/lib/activityLog'

export interface CreateExpenseState {
  error: string | null
  success: boolean
}

const CATEGORIES = ['Restock', 'Utilities', 'Rent', 'Transportation', 'Supplies', 'Other'] as const

export async function createExpenseAction(
  _prevState: CreateExpenseState,
  formData: FormData,
): Promise<CreateExpenseState> {
  const user = await requireUser()
  if (user.isDemo) return { error: DEMO_BLOCKED_MESSAGE, success: false }
  const payload = await getPayloadClient()

  const description = String(formData.get('description') ?? '').trim()
  const amount = Number(formData.get('amount'))
  const category = String(formData.get('category') ?? 'Other') as (typeof CATEGORIES)[number]
  const spentAt = String(formData.get('spentAt') ?? '').trim()
  const notes = String(formData.get('notes') ?? '').trim()

  if (!description || Number.isNaN(amount) || amount <= 0 || !CATEGORIES.includes(category)) {
    return { error: 'Please enter a description, a valid amount, and a category.', success: false }
  }

  await payload.create({
    collection: 'expenses',
    data: {
      description,
      amount,
      category,
      spentAt: spentAt ? new Date(spentAt).toISOString() : new Date().toISOString(),
      notes: notes || undefined,
      loggedBy: user.id,
    },
  })

  await logActivity(payload, user.id, 'expense', `Logged expense "${description}" — ₱${amount} (${category})`)

  revalidatePath('/expenses')
  revalidatePath('/sales')
  revalidatePath('/logs')

  return { error: null, success: true }
}

export async function deleteExpenseAction(expenseId: number) {
  const user = await requireAdmin()
  assertNotDemo(user)
  const payload = await getPayloadClient()

  const expense = await payload.findByID({ collection: 'expenses', id: expenseId })
  await payload.delete({ collection: 'expenses', id: expenseId })

  await logActivity(payload, user.id, 'expense', `Deleted expense "${expense.description}" — ₱${expense.amount}`)

  revalidatePath('/expenses')
  revalidatePath('/sales')
  revalidatePath('/logs')
}
