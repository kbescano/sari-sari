'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'
import { DEMO_BLOCKED_MESSAGE, requireAdmin } from '@/lib/auth'

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('payload-token')
  redirect('/login')
}

export interface UpdateSettingsState {
  error: string | null
  success: boolean
}

export async function updateStoreSettingsAction(
  _prevState: UpdateSettingsState,
  formData: FormData,
): Promise<UpdateSettingsState> {
  // Was previously reachable by anyone who could POST to this action — owner-only is the
  // intent (store settings), so this also closes a pre-existing access-control gap.
  const user = await requireAdmin()
  if (user.isDemo) return { error: DEMO_BLOCKED_MESSAGE, success: false }
  const payload = await getPayloadClient()

  const storeName = String(formData.get('storeName') ?? '').trim()
  const currencySymbol = String(formData.get('currencySymbol') ?? '').trim()
  const isUtangEnabled = formData.get('isUtangEnabled') === 'on'
  const lowStockThreshold = Number(formData.get('lowStockThreshold') ?? 5)

  if (!storeName) {
    return { error: 'Store name is required.', success: false }
  }

  await payload.updateGlobal({
    slug: 'store-settings',
    data: { storeName, currencySymbol, isUtangEnabled, lowStockThreshold },
  })

  revalidatePath('/', 'layout')

  return { error: null, success: true }
}
