'use client'

import { useActionState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { updateStoreSettingsAction, type UpdateSettingsState } from '@/app/(frontend)/(app)/actions'

export interface StoreSettingsValues {
  storeName: string
  currencySymbol: string
  isUtangEnabled: boolean
  lowStockThreshold: number
}

const initialState: UpdateSettingsState = { error: null, success: false }

export function SettingsModal({ settings, onClose }: { settings: StoreSettingsValues; onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(updateStoreSettingsAction, initialState)

  useEffect(() => {
    if (state.success) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card-hover"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Store Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-touch-min w-touch-min items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="storeName">Store Name</Label>
            <Input id="storeName" name="storeName" defaultValue={settings.storeName} required />
          </div>

          <div>
            <Label htmlFor="currencySymbol">Currency Symbol</Label>
            <Input id="currencySymbol" name="currencySymbol" defaultValue={settings.currencySymbol} maxLength={3} required />
          </div>

          <div>
            <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
            <Input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              min={0}
              defaultValue={settings.lowStockThreshold}
            />
          </div>

          <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <span className="text-base font-bold text-slate-700">Enable Credit (Utang) Ledger</span>
            <input
              type="checkbox"
              name="isUtangEnabled"
              defaultChecked={settings.isUtangEnabled}
              className="h-6 w-6 accent-primary-600"
            />
          </label>

          {state.error && (
            <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm font-semibold text-danger-700">{state.error}</p>
          )}

          <Button type="submit" size="xl" className="w-full" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </div>
    </div>
  )
}
