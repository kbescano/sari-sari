'use client'

import { useActionState } from 'react'
import { Store, Mail, Lock, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Label } from '@/components/ui/Input'
import { loginAction, type LoginState } from './actions'
import { DemoLoginSection } from '@/components/demo/DemoLoginSection'

const initialState: LoginState = { error: null }

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Store size={18} />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Store Owner Login</h1>
          <p className="text-sm text-slate-500">Sign in to manage your store</p>
        </div>

        <Card>
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input id="email" name="email" type="email" required autoComplete="email" className="pl-9" />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="pl-9"
                />
              </div>
            </div>

            {state.error && (
              <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm font-semibold text-danger-700">{state.error}</p>
            )}

            <Button type="submit" size="xl" className="w-full" disabled={isPending}>
              <LogIn size={16} />
              {isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Card>

        <DemoLoginSection />
      </div>
    </main>
  )
}
