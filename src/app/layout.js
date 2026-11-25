import './globals.css'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { logout } from '@/lib/actions'

export const metadata = { title: 'EnglishPro – Kursus Bahasa Inggris', description: 'Belajar bahasa Inggris online' }

export default async function RootLayout({ children }) {
  const u = await getUser()
  return (
    <html lang="id"><body>
      <nav><div className="wrap">
        <Link href="/" className="brand">EnglishPro</Link>
        {u ? <>
          <Link href={u.role === 'ADMIN' ? '/admin' : '/dashboard'}>{u.role === 'ADMIN' ? 'Panel Admin' : 'Kursus Saya'}</Link>
          <form action={logout}><button>Keluar ({u.name})</button></form>
        </> : <><Link href="/login">Masuk</Link><Link href="/register">Daftar</Link></>}
      </div></nav>
      <main className="wrap">{children}</main>
    </body></html>
  )
}
