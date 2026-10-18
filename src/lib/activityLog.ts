import type { Payload } from 'payload'

export type ActivityAction = 'create' | 'rename' | 'pricing' | 'stock' | 'visibility' | 'void' | 'expense'

export async function logActivity(
  payload: Payload,
  userId: number,
  action: ActivityAction,
  summary: string,
  productId?: number,
) {
  await payload.create({
    collection: 'activity-logs',
    data: { user: userId, action, product: productId, summary },
  })
}
