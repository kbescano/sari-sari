import { getPayload } from 'payload'
import config from '../src/payload.config'

const DELETE_CONCURRENCY = 15

async function wipe(payload: Awaited<ReturnType<typeof getPayload>>, collection: string) {
  let totalDeleted = 0
  // Delete in pages rather than one giant where-clause, since some adapters cap batch deletes.
  for (;;) {
    const { docs } = await payload.find({ collection: collection as never, limit: 200, depth: 0 })
    if (docs.length === 0) break
    for (let i = 0; i < docs.length; i += DELETE_CONCURRENCY) {
      const batch = docs.slice(i, i + DELETE_CONCURRENCY)
      await Promise.all(batch.map((doc) => payload.delete({ collection: collection as never, id: doc.id })))
    }
    totalDeleted += docs.length
    console.log(`  ...${totalDeleted} deleted from ${collection} so far`)
  }
  console.log(`Deleted ${totalDeleted} from ${collection}`)
}

async function main() {
  const payload = await getPayload({ config })

  // FK-safe order: children before parents.
  await wipe(payload, 'activity-logs')
  await wipe(payload, 'debt-ledger')
  await wipe(payload, 'orders')
  await wipe(payload, 'products')
  await wipe(payload, 'categories')

  console.log('Reset complete.')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
