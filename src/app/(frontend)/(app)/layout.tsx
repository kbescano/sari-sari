import type { ReactNode } from 'react'
import { requireUser } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { StoreSettingsHydrator } from '@/lib/store/StoreSettingsHydrator'
import { DemoModeHydrator } from '@/lib/store/DemoModeHydrator'
import { Nav } from '@/components/nav/Nav'
import { DemoBanner } from '@/components/demo/DemoBanner'
import { DemoTour } from '@/components/demo/DemoTour'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser()
  const isAdmin = user.role === 'owner'
  const isDemo = Boolean(user.isDemo)

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
      <DemoModeHydrator isDemo={isDemo} demoRole={isDemo ? (isAdmin ? 'owner' : 'staff') : null} />
      {isDemo && <DemoBanner />}
      <Nav storeName={normalizedSettings.storeName} settings={normalizedSettings} isAdmin={isAdmin} />
      <div className="pb-20 sm:pb-0">{children}</div>
      {isDemo && <DemoTour isAdmin={isAdmin} />}
    </div>
  )
}
