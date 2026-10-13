'use client'

import { useEffect } from 'react'
import { useStoreSettings, type StoreSettings } from './useStoreSettings'

// Rendered once near the root of the admin portal and the storefront layout.
// Receives the global fetched server-side and pushes it into the client Zustand store
// so every client component downstream can read `isUtangEnabled` synchronously.
export function StoreSettingsHydrator({ settings }: { settings: StoreSettings }) {
  const hydrate = useStoreSettings((state) => state.hydrate)

  useEffect(() => {
    hydrate(settings)
  }, [hydrate, settings])

  return null
}
