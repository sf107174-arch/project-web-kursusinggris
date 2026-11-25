import Link from 'next/link'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const u = await requireUser('STUDENT')
  const [mine, all, done] = await Promise.all([
    db.enrollment.findMany({ where: { userId: u.id }, include: { course: { include: { lessons: true } } } }),
    db.course.findMany(),
    db.progress.findMany({ where: { userId: u.id } }),
  ])
  const doneIds = new Set(done.map(d => d.lessonId))
  const enrolled = new Set(mine.map(m => m.courseId))
  return (<>
    <h1>Halo, {u.name}</h1>
    <h2>Kursus saya</h2>
    {!mine.length && <p>Belum ada kursus. Pilih salah satu di bawah.</p>}
    <div className="grid">{mine.map(({ course: c }) => {
      const n = c.lessons.filter(l => doneIds.has(l.id)).length, pct = c.lessons.length ? Math.round(n / c.lessons.length * 100) : 0
      return <Link key={c.id} href={`/courses/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="card"><span className="badge">{c.level}</span><h3>{c.title}</h3>
          <div className="bar"><i style={{ width: pct + '%' }} /></div><small>{n}/{c.lessons.length} selesai ({pct}%)</small></div></Link>
    })}</div>
    <h2 style={{ marginTop: 32 }}>Kursus lainnya</h2>
    <div className="grid">{all.filter(c => !enrolled.has(c.id)).map(c => (
      <Link key={c.id} href={`/courses/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="card"><span className="badge">{c.level}</span><h3>{c.title}</h3><p>{c.description}</p></div></Link>))}
    </div>
  </>)
}
