import { History, PackagePlus, Pencil, Tag, Boxes, Eye, Ban, TrendingDown } from 'lucide-react'
import { requireAdminPage } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { Card } from '@/components/ui/Card'

const ACTION_ICONS = {
  create: PackagePlus,
  rename: Pencil,
  pricing: Tag,
  stock: Boxes,
  visibility: Eye,
  void: Ban,
  expense: TrendingDown,
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
      <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
        <History size={20} className="text-primary-600" /> Activity Log
      </h1>
      <p className="text-base text-slate-500">Who added or edited inventory, and when.</p>

      {logs.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-400">
              <History size={18} />
            </span>
            <p className="text-lg font-semibold text-slate-500">No activity yet.</p>
          </div>
        </Card>
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-slate-100">
            {logs.map((log) => {
              const Icon = ACTION_ICONS[log.action]
              const userEmail = typeof log.user === 'object' ? log.user.email : 'Unknown user'
              return (
                <li key={log.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    <Icon size={15} />
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
