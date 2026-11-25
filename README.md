# EnglishPro – Kursus Bahasa Inggris (Next.js + Prisma + SQLite)

## Menjalankan
    npm install
    npm run setup     # buat database SQLite + isi data contoh
    npm run dev       # http://localhost:3000

## Akun contoh
- Admin: admin@englishpro.id / admin123
- Peserta: peserta@englishpro.id / peserta123

Ganti SESSION_SECRET di `.env` sebelum deploy. Untuk PostgreSQL/MySQL, ubah `provider` dan `DATABASE_URL` di `prisma/schema.prisma` lalu `npx prisma db push`.

## Keamanan
- Password di-hash dengan `bcryptjs` (`bcrypt.hash` saat register/seed, `bcrypt.compare` saat login).
- `src/middleware.js` menjaga `/dashboard` dan `/admin` di server dengan membaca cookie bertanda tangan (tanpa akses database). Halaman tetap memeriksa ulang lewat `requireUser()`.
