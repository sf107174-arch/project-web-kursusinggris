import { register } from '@/lib/actions'

export default function Page({ searchParams }) {
  return (
    <div className="card" style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>Daftar</h2>
      {searchParams.error && <p className="err">{searchParams.error}</p>}
      <form action={register}>
        <label>Nama<input name="name" required /></label><label>Email<input name="email" type="email" required /></label>
        <label>Password<input name="password" type="password" required /></label>
        <button className="btn">Daftar</button>
      </form>
    </div>
  )
}
