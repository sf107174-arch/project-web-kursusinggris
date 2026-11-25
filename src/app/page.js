import Link from 'next/link'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const courses = await db.course.findMany({ include: { _count: { select: { lessons: true } } } })
  return (<>
    <h1>Speak English with confidence.</h1>
    <p style={{ maxWidth: 560 }}>Pilih level, ikuti pelajaran singkat setiap hari, dan pantau kemajuanmu.</p>
    <p><Link className="btn" href="/register">Daftar gratis</Link></p>
    <h2 style={{ marginTop: 40 }}>Kursus tersedia</h2>
    <div className="grid">{courses.map(c => (
      <Link key={c.id} href={`/courses/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="card"><span className="badge">{c.level}</span>
          <h3>{c.title}</h3><p>{c.description}</p><small>{c._count.lessons} pelajaran</small></div>
      </Link>))}
    </div>
  </>)
}
