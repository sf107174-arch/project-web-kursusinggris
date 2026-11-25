import { NextResponse } from 'next/server'

// Berjalan di Edge Runtime: hanya baca cookie + verifikasi HMAC (Web Crypto). Tidak ada akses database.
const enc = new TextEncoder()
async function hmac(v) {
  const key = await crypto.subtle.importKey('raw', enc.encode(process.env.SESSION_SECRET || 'dev-secret'),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(v))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
async function readSession(req) {
  const c = req.cookies.get('sid')?.value
  if (!c) return null
  const [id, role, sig] = c.split('.')
  return sig && sig === (await hmac(`${id}.${role}`)) ? { id, role } : null
}

export async function middleware(req) {
  const s = await readSession(req)
  const p = req.nextUrl.pathname
  const go = (to) => NextResponse.redirect(new URL(to, req.url))
  if (p.startsWith('/admin')) {
    if (!s) return go('/login')
    if (s.role !== 'ADMIN') return go('/dashboard')
  }
  if (p.startsWith('/dashboard')) {
    if (!s) return go('/login')
    if (s.role === 'ADMIN') return go('/admin')
  }
  return NextResponse.next()
}
export const config = { matcher: ['/admin/:path*', '/dashboard/:path*'] }
