import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

interface DJProfile {
  stage_name: string
  city: string
}

interface VenueProfile {
  name: string
  city: string
  capacity: number
}

interface Stats {
  total: number
  completed: number
  third: number
}

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [profileType, setProfileType] = useState<'dj' | 'venue' | null>(null)
  const [djProfile, setDjProfile] = useState<DJProfile | null>(null)
  const [venueProfile, setVenueProfile] = useState<VenueProfile | null>(null)
  const [stats] = useState<Stats>({ total: 0, completed: 0, third: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    async function fetchProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('dashboard session:', session?.user?.id)

      if (!session) {
        setLoading(false)
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('type')
        .eq('id', session.user.id)
        .maybeSingle()

      console.log('dashboard profile data:', profile)
      console.log('dashboard profile error:', profileError)

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      const raw = Array.isArray(profile) ? profile[0] : profile
      const type = raw?.type as 'dj' | 'venue' | null
      setProfileType(type)

      if (type === 'dj') {
        const { data, error: djError } = await supabase
          .from('dj_profiles')
          .select('stage_name, city')
          .eq('user_id', session.user.id)
          .single()

        if (djError) setError(djError.message)
        else setDjProfile(data)
      } else if (type === 'venue') {
        const { data, error: venueError } = await supabase
          .from('venue_profiles')
          .select('name, city, capacity')
          .eq('user_id', session.user.id)
          .single()

        if (venueError) setError(venueError.message)
        else setVenueProfile(data)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [user])

  async function handleSignOut() {
    await signOut()
    navigate('/auth', { replace: true })
  }

  if (loading) {
    return (
      <div
        style={{ minHeight: '100svh', background: '#050505' }}
        className="flex items-center justify-center"
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: '2px solid #1f1f1f',
            borderTopColor: '#FF2D78',
            borderRadius: '50%',
          }}
          className="animate-spin"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{ minHeight: '100svh', background: '#050505' }}
        className="flex items-center justify-center px-4"
      >
        <p className="text-sm text-red-400">{error}</p>
      </div>
    )
  }

  if (!profileType) {
    return (
      <div
        style={{ minHeight: '100svh', background: '#050505' }}
        className="flex flex-col items-center justify-center gap-4 px-4"
      >
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#ffffff60' }} className="text-sm">
          Profilini tamamla ve başla.
        </p>
        <Link
          to="/onboarding"
          style={{ background: '#FF2D78', fontFamily: "'Space Grotesk', sans-serif" }}
          className="rounded-xl px-6 py-3 text-sm font-semibold text-white cursor-pointer hover:brightness-110 transition"
        >
          Profili Tamamla →
        </Link>
      </div>
    )
  }

  if (profileType === 'dj') {
    return (
      <Shell onSignOut={handleSignOut}>
        <DJDashboard userId={user!.id} profile={djProfile} stats={stats} />
      </Shell>
    )
  }

  return (
    <Shell onSignOut={handleSignOut}>
      <VenueDashboard userId={user!.id} profile={venueProfile} stats={stats} />
    </Shell>
  )
}

function Shell({
  children,
  onSignOut,
}: {
  children: React.ReactNode
  onSignOut: () => void
}) {
  return (
    <div style={{ minHeight: '100svh', background: '#050505' }} className="flex flex-col">
      <header
        style={{ background: '#0d0d0d', borderBottom: '1px solid #1f1f1f' }}
        className="px-4 sm:px-8 py-4 flex items-center justify-between"
      >
        <span
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#FF2D78' }}
          className="text-lg font-bold tracking-tight"
        >
          RaverUp
        </span>
        <button
          onClick={onSignOut}
          style={{ border: '1px solid #1f1f1f', color: '#ffffff50', fontFamily: 'Inter, sans-serif' }}
          className="rounded-lg px-4 py-1.5 text-xs cursor-pointer hover:border-white/30 transition"
        >
          Çıkış
        </button>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-10">
        {children}
      </main>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{ background: '#0d0d0d', border: '1px solid #1f1f1f' }}
      className="rounded-2xl px-6 py-5 flex flex-col gap-1"
    >
      <span
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}
        className="text-2xl font-bold"
      >
        {value}
      </span>
      <span
        style={{ fontFamily: 'Inter, sans-serif', color: '#ffffff50' }}
        className="text-xs"
      >
        {label}
      </span>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2
      style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}
      className="text-lg font-semibold mb-4"
    >
      {title}
    </h2>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{ border: '1px dashed #1f1f1f' }}
      className="rounded-2xl px-6 py-12 flex items-center justify-center"
    >
      <p style={{ fontFamily: 'Inter, sans-serif', color: '#ffffff30' }} className="text-sm">
        {message}
      </p>
    </div>
  )
}

function DJDashboard({
  userId,
  profile,
  stats,
}: {
  userId: string
  profile: DJProfile | null
  stats: Stats
}) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#ffffff40' }} className="text-sm mb-1">
            Merhaba,
          </p>
          <h1
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}
            className="text-3xl font-bold"
          >
            {profile?.stage_name ?? '—'}
          </h1>
          {profile?.city && (
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#ffffff50' }} className="text-sm mt-1">
              {profile.city}
            </p>
          )}
        </div>

        <Link
          to={`/dj/${userId}`}
          style={{ background: '#FF2D78', fontFamily: "'Space Grotesk', sans-serif" }}
          className="self-start sm:self-auto rounded-xl px-5 py-2.5 text-sm font-semibold text-white cursor-pointer hover:brightness-110 transition whitespace-nowrap"
        >
          Profilimi Görüntüle
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Toplam Booking" value={stats.total} />
        <StatCard label="Tamamlanan" value={stats.completed} />
        <StatCard label="Yanıt Oranı" value={`${stats.third}%`} />
      </div>

      {/* Booking offers */}
      <div>
        <SectionHeader title="Booking Teklifleri" />
        <EmptyState message="Henüz teklif yok." />
      </div>
    </div>
  )
}

function VenueDashboard({
  userId,
  profile,
  stats,
}: {
  userId: string
  profile: VenueProfile | null
  stats: Stats
}) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#ffffff40' }} className="text-sm mb-1">
            Merhaba,
          </p>
          <h1
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}
            className="text-3xl font-bold"
          >
            {profile?.name ?? '—'}
          </h1>
          {profile?.city && (
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#ffffff50' }} className="text-sm mt-1">
              {profile.city}
              {profile?.capacity ? ` · ${profile.capacity.toLocaleString('tr-TR')} kişilik` : ''}
            </p>
          )}
        </div>

        <Link
          to={`/venue/${userId}`}
          style={{ background: '#FF2D78', fontFamily: "'Space Grotesk', sans-serif" }}
          className="self-start sm:self-auto rounded-xl px-5 py-2.5 text-sm font-semibold text-white cursor-pointer hover:brightness-110 transition whitespace-nowrap"
        >
          Profilimi Görüntüle
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Toplam Booking" value={stats.total} />
        <StatCard label="Tamamlanan" value={stats.completed} />
        <StatCard label="Aktif İlan" value={stats.third} />
      </div>

      {/* Booking offers */}
      <div>
        <SectionHeader title="Booking Teklifleri" />
        <EmptyState message="Henüz teklif yok." />
      </div>
    </div>
  )
}
