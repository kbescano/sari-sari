import type { CollectionConfig } from 'payload'
import { loggedInAndNotDemo } from './access'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Order', plural: 'Orders (Benta)' },
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'customerName', 'orderType', 'totalAmount', 'status'],
  },
  access: {
    read: ({ req }) => Boolean(req.user), // owner/staff only — customers don't log in to view other orders
    // Was public for a storefront checkout flow that was removed and never actually shipped
    // (POS always creates orders via the local API, which bypasses access control anyway).
    create: loggedInAndNotDemo,
    update: loggedInAndNotDemo,
    delete: loggedInAndNotDemo,
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Generated server-side, e.g. "SS-00042".' },
    },
    { name: 'customerName', type: 'text', required: true },
    { name: 'customerPhone', type: 'text', required: true },
    {
      name: 'orderType',
      type: 'select',
      required: true,
      defaultValue: 'In-Store',
      options: [
        { label: 'Reserve & Pickup', value: 'Pickup' },
        { label: 'In-Store (POS)', value: 'In-Store' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products', required: true },
        { name: 'quantity', type: 'number', required: true, min: 1 },
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
          admin: { description: 'Selling price snapshot at time of order — product price may change later.' },
        },
        {
          name: 'costPrice',
          type: 'number',
          required: true,
          defaultValue: 0,
          min: 0,
          admin: { description: 'Cost price snapshot at time of order — basis for real net profit, not an estimate.' },
        },
      ],
    },
    { name: 'totalAmount', type: 'number', required: true, min: 0 },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      defaultValue: 'Cash',
      options: [
        { label: 'Cash', value: 'Cash' },
        { label: 'GCash', value: 'GCash' },
        { label: 'Credit / Utang', value: 'Credit/Utang' },
      ],
      admin: {
        description: '"Credit/Utang" is only selectable in POS UI when the store\'s Utang feature is enabled.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'Pending',
      options: [
        { label: 'Pending', value: 'Pending' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Cancelled', value: 'Cancelled' },
      ],
    },
  ],
}
