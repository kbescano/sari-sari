import type { CollectionConfig } from 'payload'
import { loggedInAndNotDemo } from './access'

export const Expenses: CollectionConfig = {
  slug: 'expenses',
  labels: { singular: 'Expense', plural: 'Expenses (Gastos)' },
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['description', 'category', 'amount', 'spentAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: loggedInAndNotDemo,
    update: loggedInAndNotDemo,
    delete: loggedInAndNotDemo,
  },
  fields: [
    { name: 'description', type: 'text', required: true, admin: { description: 'e.g. "Restock soft drinks", "Electric bill"' } },
    { name: 'amount', type: 'number', required: true, min: 0 },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'Restock',
      options: [
        { label: 'Restock / Inventory', value: 'Restock' },
        { label: 'Utilities', value: 'Utilities' },
        { label: 'Rent', value: 'Rent' },
        { label: 'Transportation', value: 'Transportation' },
        { label: 'Supplies', value: 'Supplies' },
        { label: 'Other', value: 'Other' },
      ],
    },
    {
      name: 'spentAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { description: 'When the money actually went out — used for period filtering on the Sales Report.' },
    },
    { name: 'notes', type: 'textarea' },
    { name: 'loggedBy', type: 'relationship', relationTo: 'users', required: true },
  ],
}
