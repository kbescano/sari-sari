import type { CollectionConfig } from 'payload'
import { loggedInAndNotDemo } from './access'

export const Media: CollectionConfig = {
  slug: 'media',
  // No access config previously meant Payload's default (public) applied to create/update/
  // delete too — anyone could upload or delete files via the API. Read stays public since
  // product images need to render on the public storefront.
  access: {
    read: () => true,
    create: loggedInAndNotDemo,
    update: loggedInAndNotDemo,
    delete: loggedInAndNotDemo,
  },
  upload: {
    staticDir: 'media',
    imageSizes: [{ name: 'thumbnail', width: 320, height: 320, position: 'centre' }],
    mimeTypes: ['image/*'],
  },
  fields: [{ name: 'alt', type: 'text' }],
}
