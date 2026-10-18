'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Package, BarChart3, TrendingDown, History } from 'lucide-react'

const TABS = [
  { href: '/', label: 'POS', icon: ShoppingCart },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/sales', label: 'Sales', icon: BarChart3 },
  { href: '/expenses', label: 'Expenses', icon: TrendingDown },
] as const

const ADMIN_TABS = [{ href: '/logs', label: 'Logs', icon: History }] as const

export function BottomTabBar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const tabs = isAdmin ? [...TABS, ...ADMIN_TABS] : TABS

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-100 bg-white/95 backdrop-blur-xl sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-slate-400"
          >
            <Icon size={21} strokeWidth={isActive ? 2.25 : 1.75} className={isActive ? 'text-slate-900' : 'text-slate-400'} />
            <span className={`text-[10px] font-semibold tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
