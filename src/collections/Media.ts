import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  upload: {
    staticDir: 'media',
    imageSizes: [{ name: 'thumbnail', width: 320, height: 320, position: 'centre' }],
    mimeTypes: ['image/*'],
  },
  fields: [{ name: 'alt', type: 'text' }],
}
