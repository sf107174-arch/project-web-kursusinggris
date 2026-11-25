const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const db = new PrismaClient()
const courses = [
  ['English Basics', 'Beginner', 'Salam, perkenalan diri, angka, dan kalimat sehari-hari.', [
    ['Greetings & Introductions', 'Hello / Hi / Good morning.\nMy name is Rina. Nice to meet you.\nHow are you? I am fine, thank you.'],
    ['Numbers & Time', 'One to twenty. What time is it? It is half past three.'],
    ['Present Simple', 'I study English every day. She works at a bank. They do not live here.']]],
  ['Everyday Conversation', 'Intermediate', 'Percakapan di restoran, toko, bandara, dan telepon.', [
    ['At the Restaurant', 'Could I see the menu, please?\nI would like the grilled fish.\nCould we have the bill?'],
    ['Asking for Directions', 'Excuse me, how do I get to the station?\nGo straight, then turn left at the bank.'],
    ['Past Simple', 'Yesterday I visited my grandmother. We cooked dinner and watched a film.']]],
  ['Business English', 'Advanced', 'Email, rapat, presentasi, dan negosiasi profesional.', [
    ['Writing Formal Emails', 'Dear Mr. Smith,\nI am writing to inquire about...\nI look forward to hearing from you.\nBest regards,'],
    ['Meetings & Opinions', 'I would like to raise a point. In my view, we should postpone the launch. I see your point, however...'],
    ['Presentations', 'Today I will walk you through three key results. Let us move on to the next slide.']]],
]
async function main() {
  await db.user.upsert({ where: { email: 'admin@englishpro.id' }, update: {}, create: { name: 'Admin', email: 'admin@englishpro.id', password: await bcrypt.hash('admin123', 10), role: 'ADMIN' } })
  await db.user.upsert({ where: { email: 'peserta@englishpro.id' }, update: {}, create: { name: 'Rina Peserta', email: 'peserta@englishpro.id', password: await bcrypt.hash('peserta123', 10), role: 'STUDENT' } })
  if (await db.course.count()) return
  for (const [title, level, description, lessons] of courses)
    await db.course.create({ data: { title, level, description, lessons: { create: lessons.map(([t, c], i) => ({ title: t, content: c, order: i + 1 })) } } })
}
main().finally(() => db.$disconnect())
