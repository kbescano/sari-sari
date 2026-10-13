'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Package, BarChart3, History, Settings, LogOut, Store } from 'lucide-react'
import { logoutAction } from '@/app/(frontend)/(app)/actions'
import { SettingsModal, type StoreSettingsValues } from './SettingsModal'
import { BottomTabBar } from './BottomTabBar'

const NAV_LINKS = [
  { href: '/', label: 'POS', icon: ShoppingCart },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/sales', label: 'Sales Report', icon: BarChart3 },
] as const

const ADMIN_NAV_LINKS = [{ href: '/logs', label: 'Logs', icon: History }] as const

export function Nav({
  storeName,
  settings,
  isAdmin,
}: {
  storeName: string
  settings: StoreSettingsValues
  isAdmin: boolean
}) {
  const pathname = usePathname()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const navLinks = isAdmin ? [...NAV_LINKS, ...ADMIN_NAV_LINKS] : NAV_LINKS

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5">
          <Link
            href="/"
            aria-label="Home"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-xl py-1 pr-2 hover:bg-slate-100 sm:flex-none sm:pr-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white">
              <Store size={18} />
            </div>
            <span className="min-w-0 flex-1 text-base font-bold leading-tight tracking-tight text-slate-900 sm:flex-none sm:whitespace-nowrap sm:text-lg">
              {storeName}
            </span>
          </Link>

          <nav className="hidden flex-1 items-center gap-1 sm:flex">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  className={`flex h-touch-min items-center gap-2 whitespace-nowrap rounded-2xl px-4 text-lg font-semibold transition-colors ${
                    isActive ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Store settings"
              className="flex h-touch-min w-touch-min items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <Settings size={22} />
            </button>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Log out"
                className="flex h-touch-min w-touch-min items-center justify-center rounded-xl text-slate-500 hover:bg-danger-50 hover:text-danger-600"
              >
                <LogOut size={22} />
              </button>
            </form>
          </div>
        </div>
      </header>

      <BottomTabBar isAdmin={isAdmin} />

      {isSettingsOpen && <SettingsModal settings={settings} onClose={() => setIsSettingsOpen(false)} />}
    </>
  )
}
