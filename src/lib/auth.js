import crypto from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from './db'

const secret = process.env.SESSION_SECRET || 'dev-secret'
const sign = (v) => crypto.createHmac('sha256', secret).update(v).digest('hex')

// Cookie "sid" = id.role.signature (role ikut ditandatangani agar middleware bisa cek tanpa database)
export function setSession(user) {
  const v = `${user.id}.${user.role}`
  cookies().set('sid', `${v}.${sign(v)}`, {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production',
  })
}
export function clearSession() { cookies().delete('sid') }

export async function getUser() {
  const c = cookies().get('sid')?.value
  if (!c) return null
  const [id, role, sig] = c.split('.')
  const good = sign(`${id}.${role}`)
  const ok = sig && sig.length === good.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))
  return ok ? db.user.findUnique({ where: { id: Number(id) } }) : null // role asli selalu dari database
}
export async function requireUser(role) {
  const u = await getUser()
  if (!u) redirect('/login')
  if (role && u.role !== role) redirect(u.role === 'ADMIN' ? '/admin' : '/dashboard')
  return u
}
