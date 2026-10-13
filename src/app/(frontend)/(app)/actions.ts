'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'

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
