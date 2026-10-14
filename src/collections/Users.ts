import type { CollectionConfig } from 'payload'
import { loggedInAndNotDemo } from './access'

// Store owner + staff accounts for the admin portal. Customers never need an account.
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: loggedInAndNotDemo,
    update: loggedInAndNotDemo,
    delete: loggedInAndNotDemo,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      options: [
        { label: 'Owner', value: 'owner' },
        { label: 'Staff', value: 'staff' },
      ],
    },
    {
      name: 'isDemo',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Sandboxed account used by the public "Try the Demo" login. Every mutating server action refuses to run for isDemo accounts — see assertNotDemo() in src/lib/auth.ts.',
      },
    },
  ],
}
