import type { GlobalConfig } from 'payload'
import { loggedInAndNotDemo } from './access'

// Single-doc "global" — one row for the whole store, not a collection of many.
export const StoreSettings: GlobalConfig = {
  slug: 'store-settings',
  label: 'Store Settings',
  access: {
    read: () => true, // storefront + POS both need this to render feature flags
    update: loggedInAndNotDemo, // only logged-in owner/staff can change it
  },
  fields: [
    {
      name: 'storeName',
      type: 'text',
      required: true,
      defaultValue: 'Aling Nena Sari-Sari Store',
    },
    {
      name: 'currencySymbol',
      type: 'text',
      required: true,
      defaultValue: '₱',
      maxLength: 3,
    },
    {
      name: 'isUtangEnabled',
      type: 'checkbox',
      label: 'Enable Digital Listahan ng Utang',
      defaultValue: false,
      admin: {
        description:
          'When OFF, all credit/utang UI (ledger tab, "record as credit" at checkout, uncollected-debt card) is fully hidden across the app.',
      },
    },
    {
      name: 'lowStockThreshold',
      type: 'number',
      label: 'Low stock warning threshold',
      defaultValue: 5,
      min: 0,
      admin: {
        description: 'Products at or below this quantity show the "paalala" low-stock badge.',
      },
    },
  ],
}
