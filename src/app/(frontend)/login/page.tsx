'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Store, Mail, Lock, LogIn, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Label } from '@/components/ui/Input'
import { loginAction, type LoginState } from './actions'

const initialState: LoginState = { error: null }

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50 to-slate-50 p-4">
      <div className="w-full max-w-sm">
        <Link
          href="/shop"
          className="mb-4 inline-flex h-touch-min items-center gap-2 rounded-xl px-2 text-base font-semibold text-slate-500 hover:bg-white/60 hover:text-slate-700"
        >
          <ArrowLeft size={18} />
          Back to Store
        </Link>

        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-card">
            <Store size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Store Owner Login</h1>
          <p className="text-base text-slate-500">Sign in to manage your store</p>
        </div>

        <Card>
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <Input id="email" name="email" type="email" required autoComplete="email" className="pl-10" />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="pl-10"
                />
              </div>
            </div>

            {state.error && (
              <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm font-semibold text-danger-700">{state.error}</p>
            )}

            <Button type="submit" size="xl" className="w-full" disabled={isPending}>
              <LogIn size={22} />
              {isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}
