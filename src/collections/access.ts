// Demo accounts (Users.isDemo — see the "Try the Demo" login) authenticate as real Payload
// users, so Server Action guards alone (assertNotDemo in src/lib/auth.ts) aren't enough: a
// demo session could otherwise open /admin, or call the REST/GraphQL API directly, and mutate
// real store data through Payload itself, bypassing every custom action entirely. This access
// function is the layer that closes that — it runs for every create/update/delete regardless
// of entry point, so every collection's create/update/delete should use it instead of a bare
// `Boolean(req.user)` check.
export function loggedInAndNotDemo({ req }: { req: { user?: { isDemo?: boolean | null } | null } }) {
  return Boolean(req.user) && !req.user?.isDemo
}
