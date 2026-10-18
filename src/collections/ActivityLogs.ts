import type { CollectionConfig } from 'payload'
import { loggedInAndNotDemo } from './access'

// Audit trail for inventory changes — who added or edited a product, and what changed.
// Entries are created server-side only (see inventory/actions.ts); never edited after the fact.
export const ActivityLogs: CollectionConfig = {
  slug: 'activity-logs',
  labels: { singular: 'Activity Log', plural: 'Activity Logs' },
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['summary', 'user', 'createdAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: loggedInAndNotDemo,
    update: () => false,
    delete: loggedInAndNotDemo,
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Added Product', value: 'create' },
        { label: 'Renamed Product', value: 'rename' },
        { label: 'Updated Pricing', value: 'pricing' },
        { label: 'Adjusted Stock', value: 'stock' },
        { label: 'Toggled Visibility', value: 'visibility' },
        { label: 'Voided Sale', value: 'void' },
        { label: 'Logged Expense', value: 'expense' },
      ],
    },
    { name: 'product', type: 'relationship', relationTo: 'products' },
    { name: 'summary', type: 'text', required: true, admin: { description: 'Human-readable description of the change.' } },
  ],
}
