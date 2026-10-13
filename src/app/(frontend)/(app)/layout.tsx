import type { ReactNode } from 'react'
import { requireUser } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { StoreSettingsHydrator } from '@/lib/store/StoreSettingsHydrator'
import { Nav } from '@/components/nav/Nav'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser()
  const isAdmin = user.role === 'owner'

  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'store-settings' })

  const normalizedSettings = {
    storeName: settings.storeName,
    currencySymbol: settings.currencySymbol,
    isUtangEnabled: settings.isUtangEnabled ?? false,
    lowStockThreshold: settings.lowStockThreshold ?? 5,
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreSettingsHydrator settings={normalizedSettings} />
      <Nav storeName={normalizedSettings.storeName} settings={normalizedSettings} isAdmin={isAdmin} />
      <div className="pb-20 sm:pb-0">{children}</div>
    </div>
  )
}
