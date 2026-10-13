import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayloadClient } from './payload'

export async function getCurrentUser() {
  const payload = await getPayloadClient()
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })
  return user
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

// For use inside Server Actions triggered by a button click (not a page load) — throws
// instead of redirecting, so the client shows an error message rather than silently
// navigating the user away. UI should already hide admin-only controls from staff; this
// is the enforcement that matters even if a non-admin somehow triggers the action.
export async function requireAdmin() {
  const user = await requireUser()
  if (user.role !== 'owner') {
    throw new Error('Only the store owner can do this.')
  }
  return user
}

// Page-level guard: redirects non-admins away instead of throwing, since there's no
// client-side catch to show an error on an initial page load.
export async function requireAdminPage() {
  const user = await requireUser()
  if (user.role !== 'owner') redirect('/')
  return user
}
