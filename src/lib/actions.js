'use server'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from './db'
import { setSession, clearSession, requireUser } from './auth'

const str = (f, k) => String(f.get(k) || '').trim()
const refresh = () => revalidatePath('/', 'layout')

export async function register(f) {
  const name = str(f, 'name'), email = str(f, 'email').toLowerCase(), pw = str(f, 'password')
  if (!name || !email || pw.length < 6) redirect('/register?error=Lengkapi data (password minimal 6 karakter)')
  if (await db.user.findUnique({ where: { email } })) redirect('/register?error=Email sudah terdaftar')
  const u = await db.user.create({ data: { name, email, password: await bcrypt.hash(pw, 10), role: 'STUDENT' } })
  setSession(u); redirect('/dashboard')
}
export async function login(f) {
  const u = await db.user.findUnique({ where: { email: str(f, 'email').toLowerCase() } })
  if (!u || !(await bcrypt.compare(str(f, 'password'), u.password))) redirect('/login?error=Email atau password salah')
  setSession(u); redirect(u.role === 'ADMIN' ? '/admin' : '/dashboard')
}
export async function logout() { clearSession(); redirect('/') }

export async function enroll(f) {
  const u = await requireUser('STUDENT'); const courseId = Number(f.get('courseId'))
  await db.enrollment.upsert({ where: { userId_courseId: { userId: u.id, courseId } }, update: {}, create: { userId: u.id, courseId } })
  refresh(); redirect(`/courses/${courseId}`)
}
export async function toggleLesson(f) {
  const u = await requireUser('STUDENT'); const lessonId = Number(f.get('lessonId'))
  const key = { userId_lessonId: { userId: u.id, lessonId } }
  if (await db.progress.findUnique({ where: key })) await db.progress.delete({ where: key })
  else await db.progress.create({ data: { userId: u.id, lessonId } })
  refresh()
}

export async function createCourse(f) {
  await requireUser('ADMIN')
  await db.course.create({ data: { title: str(f, 'title'), level: str(f, 'level'), description: str(f, 'description') } })
  refresh()
}
export async function deleteCourse(f) { await requireUser('ADMIN'); await db.course.delete({ where: { id: Number(f.get('id')) } }); refresh() }
export async function addLesson(f) {
  await requireUser('ADMIN'); const courseId = Number(f.get('courseId'))
  const order = (await db.lesson.count({ where: { courseId } })) + 1
  await db.lesson.create({ data: { courseId, title: str(f, 'title'), content: str(f, 'content'), order } })
  refresh()
}
export async function deleteLesson(f) { await requireUser('ADMIN'); await db.lesson.delete({ where: { id: Number(f.get('id')) } }); refresh() }
