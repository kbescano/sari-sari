'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'

export interface LoginState {
  error: string | null
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Please enter your email and password.' }
  }

  const payload = await getPayloadClient()

  try {
    const result = await payload.login({ collection: 'users', data: { email, password } })

    if (!result.token || !result.exp) {
      return { error: 'Invalid email or password.' }
    }

    const cookieStore = await cookies()
    cookieStore.set('payload-token', result.token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(result.exp * 1000),
    })
  } catch {
    return { error: 'Invalid email or password.' }
  }

  redirect('/')
}

// Demo accounts exist purely so prospective customers can click around a live-feeling app.
// Their credentials don't need to be secret — the safety guarantee comes from assertNotDemo()
// in src/lib/auth.ts, which every mutating Server Action calls: a demo login can authenticate
// fine but can never write to real store data, no matter how it got its session.
const DEMO_ACCOUNTS = {
  owner: { email: 'demo-owner@sarisari.demo', password: 'SariSariDemo#Owner26' },
  staff: { email: 'demo-staff@sarisari.demo', password: 'SariSariDemo#Staff26' },
} as const

export async function demoLoginAction(role: 'owner' | 'staff') {
  const payload = await getPayloadClient()
  const { email, password } = DEMO_ACCOUNTS[role]

  const { docs } = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  if (!docs[0]) {
    await payload.create({ collection: 'users', data: { email, password, role, isDemo: true } })
  }

  const result = await payload.login({ collection: 'users', data: { email, password } })
  if (!result.token || !result.exp) {
    throw new Error('Could not start the demo. Please try again.')
  }

  const cookieStore = await cookies()
  cookieStore.set('payload-token', result.token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(result.exp * 1000),
  })

  redirect('/?demo=welcome')
}
