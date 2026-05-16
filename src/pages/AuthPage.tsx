import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

type Mode = 'signin' | 'signup'
type Role = 'dj' | 'venue'

export default function AuthPage() {
  const { signInWithEmail, signUpWithEmail } = useAuth()

  const [mode, setMode] = useState<Mode>('signin')
  const [role, setRole] = useState<Role>('dj')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (mode === 'signin') {
      const { error } = await signInWithEmail(email, password)
      if (error) setError(error.message)
    } else {
      const { error } = await signUpWithEmail(email, password, role)
      if (error) setError(error.message)
      else setSuccess('Hesabın oluşturuldu. E-postanı kontrol et.')
    }

    setLoading(false)
  }

  function toggleMode() {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setError(null)
    setSuccess(null)
  }

  return (
    <div
      style={{ minHeight: '100svh', background: '#050505' }}
      className="flex items-center justify-center px-4"
    >
      <div
        style={{ background: '#0d0d0d', border: '1px solid #1f1f1f' }}
        className="w-full max-w-sm rounded-2xl p-8"
      >
        {/* Logo / Brand */}
        <h1
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#FF2D78' }}
          className="text-2xl font-bold tracking-tight mb-1"
        >
          RaverUp
        </h1>
        <p className="text-sm text-white/50 mb-8">
          {mode === 'signin' ? 'Hesabına giriş yap' : 'Yeni hesap oluştur'}
        </p>

        {/* Role selector — only on signup */}
        {mode === 'signup' && (
          <div className="flex gap-2 mb-6">
            <RoleButton active={role === 'dj'} onClick={() => setRole('dj')}>
              DJ olarak kayıt
            </RoleButton>
            <RoleButton active={role === 'venue'} onClick={() => setRole('venue')}>
              Venue olarak kayıt
            </RoleButton>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs text-white/60 uppercase tracking-wider">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ background: '#111', border: '1px solid #1f1f1f', color: '#fff' }}
              className="rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#FF2D78] transition"
              placeholder="sen@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-xs text-white/60 uppercase tracking-wider">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ background: '#111', border: '1px solid #1f1f1f', color: '#fff' }}
              className="rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#FF2D78] transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}
          {success && (
            <p className="text-sm text-[#00d4aa] bg-[#00d4aa]/10 rounded-lg px-3 py-2">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ background: '#FF2D78', fontFamily: "'Space Grotesk', sans-serif" }}
            className="mt-2 rounded-lg py-2.5 text-sm font-semibold text-white cursor-pointer disabled:opacity-50 transition hover:brightness-110 active:scale-[0.98]"
          >
            {loading ? 'Bekleniyor...' : mode === 'signin' ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">
          {mode === 'signin' ? 'Hesabın yok mu?' : 'Zaten hesabın var mı?'}{' '}
          <button
            onClick={toggleMode}
            style={{ color: '#FF2D78' }}
            className="cursor-pointer font-medium hover:underline bg-transparent border-none p-0"
          >
            {mode === 'signin' ? 'Kayıt ol' : 'Giriş yap'}
          </button>
        </p>
      </div>
    </div>
  )
}

function RoleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-lg py-2 text-xs font-semibold cursor-pointer transition"
      style={{
        background: active ? '#FF2D78' : '#111',
        color: active ? '#fff' : '#ffffff99',
        border: `1px solid ${active ? '#FF2D78' : '#1f1f1f'}`,
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {children}
    </button>
  )
}
