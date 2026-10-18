import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Orders } from './collections/Orders'
import { DebtLedger } from './collections/DebtLedger'
import { ActivityLogs } from './collections/ActivityLogs'
import { Expenses } from './collections/Expenses'
import { StoreSettings } from './collections/StoreSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // Server-only — used for CORS/CSRF origin checks and absolute URL generation
  // (e.g. password reset emails), never read in browser code.
  serverURL: process.env.SERVER_URL,
  admin: {
    user: Users.slug,
  },
  editor: lexicalEditor(),
  collections: [Users, Media, Categories, Products, Orders, DebtLedger, ActivityLogs, Expenses],
  globals: [StoreSettings],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Free-tier Postgres: Supabase (500MB) or Neon (1GB) — either works via the pooled connection string.
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
})
