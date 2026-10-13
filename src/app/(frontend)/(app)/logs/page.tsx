import { History, PackagePlus, Tag, Boxes, Eye } from 'lucide-react'
import { requireAdminPage } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { Card } from '@/components/ui/Card'

const ACTION_ICONS = {
  create: PackagePlus,
  pricing: Tag,
  stock: Boxes,
  visibility: Eye,
} as const

export default async function LogsPage() {
  await requireAdminPage()

  const payload = await getPayloadClient()
  const { docs: logs } = await payload.find({
    collection: 'activity-logs',
    sort: '-createdAt',
    limit: 200,
    depth: 1,
  })

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-4">
      <h1 className="flex items-center gap-2 text-3xl font-extrabold text-slate-900">
        <History size={28} className="text-primary-600" /> Activity Log
      </h1>
      <p className="text-base text-slate-500">Who added or edited inventory, and when.</p>

      {logs.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-lg text-slate-500">No activity yet.</p>
        </Card>
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-slate-100">
            {logs.map((log) => {
              const Icon = ACTION_ICONS[log.action]
              const userEmail = typeof log.user === 'object' ? log.user.email : 'Unknown user'
              return (
                <li key={log.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-base font-semibold text-slate-900">{log.summary}</p>
                    <p className="text-sm text-slate-500">
                      {userEmail} · {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </main>
  )
}
