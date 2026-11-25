import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { createCourse, deleteCourse, addLesson, deleteLesson } from '@/lib/actions'

export const dynamic = 'force-dynamic'

export default async function Admin() {
  await requireUser('ADMIN')
  const [users, courses, enrollments, students] = await Promise.all([
    db.user.count({ where: { role: 'STUDENT' } }), db.course.count(), db.enrollment.count(),
    db.user.findMany({ where: { role: 'STUDENT' }, include: { _count: { select: { enrollments: true, progress: true } } }, orderBy: { createdAt: 'desc' } }),
  ])
  const list = await db.course.findMany({ include: { lessons: { orderBy: { order: 'asc' } }, _count: { select: { enrollments: true } } } })
  return (<>
    <h1>Panel Admin</h1>
    <div className="stats">
      <div className="card"><b>{users}</b><br />Peserta</div>
      <div className="card"><b>{courses}</b><br />Kursus</div>
      <div className="card"><b>{enrollments}</b><br />Pendaftaran</div>
    </div>
    <h2 style={{ marginTop: 32 }}>Tambah kursus</h2>
    <form action={createCourse} className="card">
      <label>Judul<input name="title" required /></label>
      <label>Level<select name="level"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
      <label>Deskripsi<textarea name="description" required /></label>
      <button className="btn">Simpan kursus</button>
    </form>
    <h2 style={{ marginTop: 32 }}>Kelola kursus</h2>
    {list.map(c => (
      <div key={c.id} className="card" style={{ marginBottom: 16 }}>
        <div className="row"><div><span className="badge">{c.level}</span> <b>{c.title}</b> <small>({c._count.enrollments} peserta)</small></div>
          <form action={deleteCourse}><input type="hidden" name="id" value={c.id} /><button className="btn red">Hapus kursus</button></form></div>
        {c.lessons.map(l => (
          <div key={l.id} className="row" style={{ borderTop: '1px solid var(--line)', padding: '6px 0' }}>
            <span>{l.order}. {l.title}</span>
            <form action={deleteLesson}><input type="hidden" name="id" value={l.id} /><button className="btn ghost">Hapus</button></form>
          </div>))}
        <details style={{ marginTop: 10 }}><summary>Tambah pelajaran</summary>
          <form action={addLesson}><input type="hidden" name="courseId" value={c.id} />
            <label>Judul<input name="title" required /></label>
            <label>Materi<textarea name="content" rows={4} required /></label>
            <button className="btn">Simpan pelajaran</button></form></details>
      </div>))}
    <h2 style={{ marginTop: 32 }}>Daftar peserta</h2>
    <table><thead><tr><th>Nama</th><th>Email</th><th>Kursus</th><th>Pelajaran selesai</th></tr></thead>
      <tbody>{students.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.email}</td><td>{s._count.enrollments}</td><td>{s._count.progress}</td></tr>)}</tbody></table>
  </>)
}
