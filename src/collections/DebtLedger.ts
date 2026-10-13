import type { CollectionConfig } from 'payload'

// Only ever read/written when storeSettings.isUtangEnabled is true — the collection
// itself stays registered either way, but admin UI nav/links should hide it when disabled.
export const DebtLedger: CollectionConfig = {
  slug: 'debt-ledger',
  labels: { singular: 'Utang Entry', plural: 'Listahan ng Utang' },
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'phone', 'totalAmount', 'isPaid'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'customerName', type: 'text', required: true },
    { name: 'phone', type: 'text', required: true },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      admin: { description: 'Optional link back to the POS order that created this debt.' },
    },
    { name: 'totalAmount', type: 'number', required: true, min: 0 },
    { name: 'notes', type: 'textarea' },
    {
      name: 'isPaid',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Toggled by the 1-tap "Mark Fully Paid" button. No partial payments.' },
    },
    {
      name: 'settledAt',
      type: 'date',
      admin: {
        description: 'Set automatically when isPaid flips to true.',
        condition: (data) => Boolean(data?.isPaid),
      },
    },
  ],
}
