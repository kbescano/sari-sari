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
