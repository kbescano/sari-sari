import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

// Selling price is always derived from costPrice + markup — never entered directly.
// This keeps every sale's recorded unitPrice traceable back to an actual cost, which is
// what lets the Sales Report compute real net profit instead of an estimate.
const computeSellingPrice: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  const costPrice = data?.costPrice ?? originalDoc?.costPrice
  const markupType = data?.markupType ?? originalDoc?.markupType ?? 'percentage'
  const markupValue = data?.markupValue ?? originalDoc?.markupValue ?? 0

  if (typeof costPrice === 'number' && data) {
    const markup = markupType === 'fixed' ? markupValue : costPrice * (markupValue / 100)
    data.sellingPrice = Math.round((costPrice + markup) * 100) / 100
  }

  return data
}

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Product', plural: 'Products (Paninda)' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'sellingPrice', 'stockQuantity', 'isActive'],
  },
  access: {
    read: () => true, // storefront catalog is public, no login required to browse
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeValidate: [computeSellingPrice],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Auto-friendly id for the catalog URL.' },
    },
    { name: 'barcode', type: 'text', admin: { description: 'For future barcode-scanner POS entry.' } },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'costPrice',
      type: 'number',
      required: true,
      min: 0,
      admin: { description: 'What the owner paid per unit — the basis for markup and net profit.' },
    },
    {
      name: 'markupType',
      type: 'select',
      required: true,
      defaultValue: 'percentage',
      options: [
        { label: 'Percentage (%)', value: 'percentage' },
        { label: 'Fixed Amount (₱)', value: 'fixed' },
      ],
    },
    {
      name: 'markupValue',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      admin: { description: 'Added on top of cost price to get the selling price.' },
    },
    {
      name: 'sellingPrice',
      type: 'number',
      required: true,
      min: 0,
      label: 'Selling price (per unit)',
      admin: {
        readOnly: true,
        description: 'Computed automatically: cost price + markup.',
      },
    },
    {
      name: 'unitType',
      type: 'select',
      required: true,
      defaultValue: 'piece',
      options: [
        { label: 'Piece (pc)', value: 'piece' },
        { label: 'Pack', value: 'pack' },
        { label: 'Sachet', value: 'sachet' },
      ],
    },
    {
      name: 'stockQuantity',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Turn off to hide from storefront + POS without deleting.' },
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}
