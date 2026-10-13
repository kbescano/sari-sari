import { getPayload } from 'payload'
import config from '@payload-config'

// Payload caches/reuses the underlying DB connection across calls in the same process,
// so it's safe to call this helper from any Server Component or Server Action.
export async function getPayloadClient() {
  return getPayload({ config })
}
