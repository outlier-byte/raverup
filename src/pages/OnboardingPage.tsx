import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

type UserType = 'dj' | 'venue'

const GENRES = [
  'Techno', 'House', 'Drum & Bass', 'Trance', 'Ambient',
  'Hip-Hop', 'Afrobeats', 'Funk / Soul', 'Minimal', 'Psytrance',
]

export default function OnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<1 | 2>(1)
  const [userType, setUserType] = useState<UserType | null>(null)

  // DJ fields
  const [stageName, setStageName] = useState('')
  const [djCity, setDjCity] = useState('')
  const [genres, setGenres] = useState<string[]>([])

  // Venue fields
  const [venueName, setVenueName] = useState('')
  const [venueCity, setVenueCity] = useState('')
  const [capacity, setCapacity] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleGenre(g: string) {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !userType) return
    setLoading(true)
    setError(null)

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ type: userType })
      .eq('id', user.id)

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    if (userType === 'dj') {
      const { error: djError } = await supabase
        .from('dj_profiles')
        .insert({ user_id: user.id, stage_name: stageName, city: djCity, genres })

      if (djError) {
        setError(djError.message)
        setLoading(false)
        return
      }
    } else {
      const { error: venueError } = await supabase
        .from('venue_profiles')
        .insert({ user_id: user.id, name: venueName, city: venueCity, capacity: Number(capacity) })

      if (venueError) {
        setError(venueError.message)
        setLoading(false)
        return
      }
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <div
      style={{ minHeight: '100svh', background: '#050505' }}
      className="flex flex-col items-center justify-center px-4 py-12"
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        <StepDot active={step === 1} done={step === 2} label="1" />
        <div style={{ width: 32, height: 1, background: step === 2 ? '#FF2D78' : '#1f1f1f' }} />
        <StepDot active={step === 2} done={false} label="2" />
        <p
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#ffffff40' }}
          className="text-xs ml-3"
        >
          {step}/2
        </p>
      </div>

      {step === 1 ? (
        <Step1
          selected={userType}
          onSelect={setUserType}
          onNext={() => userType && setStep(2)}
        />
      ) : (
        <Step2
          userType={userType!}
          stageName={stageName} setStageName={setStageName}
          djCity={djCity} setDjCity={setDjCity}
          genres={genres} toggleGenre={toggleGenre}
          venueName={venueName} setVenueName={setVenueName}
          venueCity={venueCity} setVenueCity={setVenueCity}
          capacity={capacity} setCapacity={setCapacity}
          loading={loading}
          error={error}
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  const bg = active ? '#FF2D78' : done ? '#FF2D78' : '#1f1f1f'
  return (
    <div
      style={{ width: 28, height: 28, background: bg, borderRadius: '50%' }}
      className="flex items-center justify-center"
    >
      <span
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#fff', fontSize: 12, fontWeight: 600 }}
      >
        {label}
      </span>
    </div>
  )
}

function Step1({
  selected,
  onSelect,
  onNext,
}: {
  selected: UserType | null
  onSelect: (t: UserType) => void
  onNext: () => void
}) {
  return (
    <div className="w-full max-w-lg flex flex-col gap-6">
      <div className="text-center mb-2">
        <h1
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}
          className="text-2xl font-bold mb-1"
        >
          Sen kimsin?
        </h1>
        <p className="text-sm text-white/40">Platforma nasıl katılmak istiyorsun?</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <TypeCard
          active={selected === 'dj'}
          onClick={() => onSelect('dj')}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10">
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3v2M12 19v2M3 12H1M23 12h-2" strokeLinecap="round" />
            </svg>
          }
          title="DJ / Sanatçı"
          desc="Sahneye çık, venue'larla buluş"
        />
        <TypeCard
          active={selected === 'venue'}
          onClick={() => onSelect('venue')}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10">
              <path d="M3 21h18M5 21V7l7-4 7 4v14" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="9" y="12" width="6" height="9" rx="0.5" />
            </svg>
          }
          title="Venue / Promoter"
          desc="Mekan yönet, sanatçı bul"
        />
      </div>

      <button
        onClick={onNext}
        disabled={!selected}
        style={{ background: selected ? '#FF2D78' : '#1f1f1f', fontFamily: "'Space Grotesk', sans-serif" }}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition hover:brightness-110 active:scale-[0.98]"
      >
        Devam Et →
      </button>
    </div>
  )
}

function TypeCard({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-4 rounded-2xl p-8 cursor-pointer transition-all"
      style={{
        background: '#0d0d0d',
        border: `2px solid ${active ? '#FF2D78' : '#1f1f1f'}`,
        color: active ? '#FF2D78' : '#ffffff80',
      }}
    >
      <span style={{ color: active ? '#FF2D78' : '#ffffff40' }}>{icon}</span>
      <div className="text-center">
        <p
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: active ? '#fff' : '#ffffffcc' }}
          className="font-semibold text-base mb-1"
        >
          {title}
        </p>
        <p className="text-xs" style={{ color: '#ffffff50' }}>{desc}</p>
      </div>
    </button>
  )
}

function Step2({
  userType,
  stageName, setStageName,
  djCity, setDjCity,
  genres, toggleGenre,
  venueName, setVenueName,
  venueCity, setVenueCity,
  capacity, setCapacity,
  loading,
  error,
  onBack,
  onSubmit,
}: {
  userType: UserType
  stageName: string; setStageName: (v: string) => void
  djCity: string; setDjCity: (v: string) => void
  genres: string[]; toggleGenre: (g: string) => void
  venueName: string; setVenueName: (v: string) => void
  venueCity: string; setVenueCity: (v: string) => void
  capacity: string; setCapacity: (v: string) => void
  loading: boolean
  error: string | null
  onBack: () => void
  onSubmit: (e: React.FormEvent) => void
}) {
  const isDj = userType === 'dj'

  return (
    <div
      style={{ background: '#0d0d0d', border: '1px solid #1f1f1f' }}
      className="w-full max-w-md rounded-2xl p-8"
    >
      <h2
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}
        className="text-xl font-bold mb-1"
      >
        {isDj ? 'Sanatçı bilgilerin' : 'Mekan bilgilerin'}
      </h2>
      <p className="text-sm text-white/40 mb-7">Sonra değiştirebilirsin.</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {isDj ? (
          <>
            <Field
              label="Sahne adı"
              id="stage_name"
              value={stageName}
              onChange={setStageName}
              placeholder="örn. DJ Shadow"
              required
            />
            <Field
              label="Şehir"
              id="dj_city"
              value={djCity}
              onChange={setDjCity}
              placeholder="örn. İstanbul"
              required
            />
            <div className="flex flex-col gap-2">
              <label
                style={{ fontFamily: 'Inter, sans-serif', color: '#ffffff60', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                Genre
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition"
                    style={{
                      background: genres.includes(g) ? '#FF2D78' : '#111',
                      color: genres.includes(g) ? '#fff' : '#ffffff70',
                      border: `1px solid ${genres.includes(g) ? '#FF2D78' : '#1f1f1f'}`,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <Field
              label="Venue adı"
              id="venue_name"
              value={venueName}
              onChange={setVenueName}
              placeholder="örn. Zorlu PSM"
              required
            />
            <Field
              label="Şehir"
              id="venue_city"
              value={venueCity}
              onChange={setVenueCity}
              placeholder="örn. İstanbul"
              required
            />
            <Field
              label="Kapasite"
              id="capacity"
              type="number"
              value={capacity}
              onChange={setCapacity}
              placeholder="örn. 500"
              required
              min="1"
            />
          </>
        )}

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 mt-1">
          <button
            type="button"
            onClick={onBack}
            style={{ border: '1px solid #1f1f1f', color: '#ffffff60', fontFamily: "'Space Grotesk', sans-serif" }}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold cursor-pointer transition hover:border-white/30"
          >
            ← Geri
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ background: '#FF2D78', fontFamily: "'Space Grotesk', sans-serif" }}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white cursor-pointer disabled:opacity-50 transition hover:brightness-110 active:scale-[0.98]"
          >
            {loading ? 'Kaydediliyor...' : 'Başla →'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  id,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
  min,
}: {
  label: string
  id: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  type?: string
  min?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        style={{ fontFamily: 'Inter, sans-serif', color: '#ffffff60', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        min={min}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ background: '#111', border: '1px solid #1f1f1f', color: '#fff', fontFamily: 'Inter, sans-serif' }}
        className="rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#FF2D78] transition placeholder:text-white/20"
      />
    </div>
  )
}
