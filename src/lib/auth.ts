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

export const DEMO_BLOCKED_MESSAGE =
  'This is a shared demo account — changes are not saved. Exit demo mode to use a real account.'

// Demo accounts (see Users.isDemo) can browse every page freely — only mutations are
// blocked. Call this as the very first line inside every Server Action that writes data
// (create/update/delete), right after requireUser()/requireAdmin(). Throwing here is the
// single, auditable choke point that guarantees a demo login — however it was obtained —
// can never modify real store data, even if a client-side guard is bypassed or missing.
//
// Actions whose UI already has a polished inline-error slot (useActionState forms) should
// instead check `user.isDemo` themselves and return { error: DEMO_BLOCKED_MESSAGE, ... } —
// nicer than a thrown error crashing to the route's error boundary. Plain imperative actions
// (no form state to return into) should call this and let the caller catch it client-side.
export function assertNotDemo(user: { isDemo?: boolean | null }) {
  if (user.isDemo) {
    throw new Error(DEMO_BLOCKED_MESSAGE)
  }
}
