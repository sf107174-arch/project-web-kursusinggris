import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { enroll, toggleLesson } from '@/lib/actions'

export const dynamic = 'force-dynamic'

export default async function CoursePage({ params }) {
  const c = await db.course.findUnique({ where: { id: Number(params.id) }, include: { lessons: { orderBy: { order: 'asc' } } } })
  if (!c) notFound()
  const u = await getUser()
  const isStudent = u?.role === 'STUDENT'
  const enrolled = isStudent && !!(await db.enrollment.findUnique({ where: { userId_courseId: { userId: u.id, courseId: c.id } } }))
  const done = new Set(enrolled ? (await db.progress.findMany({ where: { userId: u.id, lesson: { courseId: c.id } } })).map(p => p.lessonId) : [])
  const canRead = enrolled || u?.role === 'ADMIN'
  return (<>
    <span className="badge">{c.level}</span>
    <h1>{c.title}</h1><p>{c.description}</p>
    {!u && <p><Link className="btn" href="/login">Masuk untuk mengikuti kursus</Link></p>}
    {isStudent && !enrolled && <form action={enroll}><input type="hidden" name="courseId" value={c.id} /><button className="btn">Ikuti kursus ini</button></form>}
    {isStudent && enrolled && <div className="bar"><i style={{ width: (c.lessons.length ? done.size / c.lessons.length * 100 : 0) + '%' }} /></div>}
    {c.lessons.map(l => (
      <div key={l.id} className={'lesson' + (done.has(l.id) ? ' done' : '')}>
        <h3>{l.order}. {l.title}</h3>
        {canRead ? <pre>{l.content}</pre> : <small>Ikuti kursus untuk membuka pelajaran ini.</small>}
        {enrolled && <form action={toggleLesson}><input type="hidden" name="lessonId" value={l.id} />
          <button className={'btn' + (done.has(l.id) ? ' ghost' : '')}>{done.has(l.id) ? 'Tandai belum selesai' : 'Tandai selesai'}</button></form>}
      </div>))}
  </>)
}
