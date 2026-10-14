import { create } from 'zustand'

interface DemoModeState {
  isDemo: boolean
  demoRole: 'owner' | 'staff' | null
  hydrate: (isDemo: boolean, demoRole: 'owner' | 'staff' | null) => void
}

// Mirrors useStoreSettings: a Server Component (AppLayout) hydrates this once with the
// logged-in user's isDemo flag, so client components (CashierCounter, ProductListItem) can
// read it synchronously to simulate mutations instead of calling the real server actions.
export const useDemoMode = create<DemoModeState>((set) => ({
  isDemo: false,
  demoRole: null,
  hydrate: (isDemo, demoRole) => set({ isDemo, demoRole }),
}))
