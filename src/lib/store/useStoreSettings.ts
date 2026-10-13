import { create } from 'zustand'

export interface StoreSettings {
  storeName: string
  currencySymbol: string
  isUtangEnabled: boolean
  lowStockThreshold: number
}

interface StoreSettingsState {
  settings: StoreSettings | null
  isLoading: boolean
  hydrate: (settings: StoreSettings) => void
}

// Client-side cache of the Payload `store-settings` global. Server Components fetch the
// global directly via `getPayload().findGlobal()`; this store exists so client components
// (POS register, cart, toggle UI) can read `isUtangEnabled` without re-fetching on every render.
// A Server Component at the root of each client tree calls `hydrate()` once with the fetched
// value — see `src/app/admin-portal/layout.tsx` for the hydration call site.
export const useStoreSettings = create<StoreSettingsState>((set) => ({
  settings: null,
  isLoading: true,
  hydrate: (settings) => set({ settings, isLoading: false }),
}))

// Convenience selector so components can write `const isUtangEnabled = useIsUtangEnabled()`
// instead of repeating the null-check against `settings` everywhere.
export const useIsUtangEnabled = () => useStoreSettings((state) => state.settings?.isUtangEnabled ?? false)
