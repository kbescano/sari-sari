'use client'

import { useEffect } from 'react'
import { useDemoMode } from './useDemoMode'

export function DemoModeHydrator({ isDemo, demoRole }: { isDemo: boolean; demoRole: 'owner' | 'staff' | null }) {
  const hydrate = useDemoMode((state) => state.hydrate)

  useEffect(() => {
    hydrate(isDemo, demoRole)
  }, [hydrate, isDemo, demoRole])

  return null
}
