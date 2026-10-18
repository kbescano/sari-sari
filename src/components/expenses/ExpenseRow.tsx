'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatPeso } from '@/lib/currency'
import { deleteExpenseAction } from '@/app/(frontend)/(app)/expenses/actions'

export function ExpenseRow({
  expenseId,
  description,
  amount,
  category,
  spentAt,
  loggedByEmail,
  isAdmin,
}: {
  expenseId: number
  description: string
  amount: number
  category: string
  spentAt: string
  loggedByEmail: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteExpenseAction(expenseId)
        router.refresh()
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'Could not delete this expense.')
        setIsConfirming(false)
      }
    })
  }

  return (
    <li className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="break-words font-bold text-slate-900">{description}</p>
          <p className="text-sm text-slate-500">
            {loggedByEmail} · {new Date(spentAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone="neutral">{category}</Badge>
          <p className="text-lg font-extrabold tabular-nums text-danger-600">-{formatPeso(amount)}</p>
        </div>
      </div>

      {isAdmin && (
        <div className="flex items-center justify-end gap-2">
          {error && <p className="mr-auto text-sm font-semibold text-danger-700">{error}</p>}
          {isConfirming ? (
            <>
              <span className="text-sm font-semibold text-slate-600">Delete this expense?</span>
              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                className="h-touch-min rounded-lg px-3 text-sm font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="h-touch-min rounded-lg bg-danger-600 px-3 text-sm font-bold text-white transition-[background-color,transform] duration-150 ease-[var(--ease-out-snap)] hover:bg-danger-700 active:scale-[0.97] disabled:opacity-50"
              >
                {isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirming(true)}
              className="flex h-touch-min items-center gap-1.5 rounded-lg px-3 text-sm font-bold text-danger-600 hover:bg-danger-50"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      )}
    </li>
  )
}
