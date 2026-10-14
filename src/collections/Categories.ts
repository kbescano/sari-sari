import type { CollectionConfig } from 'payload'
import { loggedInAndNotDemo } from './access'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Category', plural: 'Categories' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'displayOrder'] },
  access: {
    read: () => true,
    create: loggedInAndNotDemo,
    update: loggedInAndNotDemo,
    delete: loggedInAndNotDemo,
  },
  fields: [
    { name: 'name', type: 'text', required: true }, // e.g. "Inumin" (Drinks)
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'URL/filter-safe id, e.g. "drinks"' },
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Lower numbers show first in the category chip row.' },
    },
  ],
}
