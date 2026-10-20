'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE } from './_lib/session'

export async function logout() {
  ;(await cookies()).delete({ name: SESSION_COOKIE, path: '/admin' })
  redirect('/admin')
}
