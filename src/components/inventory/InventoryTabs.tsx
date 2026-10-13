import Link from 'next/link'
import { Boxes, AlertTriangle, Trophy } from 'lucide-react'

export type InventoryTab = 'stock' | 'low' | 'best'

const TABS: { value: InventoryTab; label: string; icon: typeof Boxes }[] = [
  { value: 'stock', label: 'Current Stock', icon: Boxes },
  { value: 'low', label: 'Low Stock', icon: AlertTriangle },
  { value: 'best', label: 'Best Seller', icon: Trophy },
]

export function InventoryTabs({ activeTab, lowStockCount }: { activeTab: InventoryTab; lowStockCount: number }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
      {TABS.map(({ value, label, icon: Icon }) => {
        const isActive = activeTab === value
        return (
          <Link
            key={value}
            href={value === 'stock' ? '/inventory' : `/inventory?tab=${value}`}
            className={`flex h-touch-min items-center gap-2 rounded-lg px-4 text-base font-bold transition-colors ${
              isActive ? 'bg-white text-primary-700 shadow-card' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon size={18} />
            {label}
            {value === 'low' && lowStockCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-100 px-1 text-xs font-extrabold text-danger-700">
                {lowStockCount}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
