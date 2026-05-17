import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface DJProfile {
  id: string
  name: string
  city: string
}

interface VenueProfile {
  id: string
  name: string
  city: string
  capacity: number
}

interface Stats {
  total: number
  completed: number
  third: number
}

interface Booking {
  id: string
  event_date: string
  status: 'pending' | 'accepted' | 'declined'
  initiated_by: 'dj' | 'venue'
  venue_id: string
}

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [profileType, setProfileType] = useState<'dj' | 'venue' | null>(null)
  const [djProfile, setDjProfile] = useState<DJProfile | null>(null)
  const [venueProfile, setVenueProfile] = useState<VenueProfile | null>(null)
  const [stats] = useState<Stats>({ total: 0, completed: 0, third: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('user:', user?.id)

      if (!user) { window.location.href = '/auth'; return }
      setUserId(user.id)

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('type')
        .eq('user_id', user.id)
        .maybeSingle()

      console.log('profile:', profile, 'error:', profileError)

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      if (!profile) { window.location.href = '/onboarding'; return }

      const type = profile.type as 'dj' | 'venue'
      setProfileType(type)

      if (type === 'dj') {
        const { data, error: djError } = await supabase
          .from('dj_profiles')
          .select('id, name, city')
          .eq('user_id', user.id)
          .single()

        if (djError) setError(djError.message)
        else setDjProfile(data)
      } else if (type === 'venue') {
        const { data, error: venueError } = await supabase
          .from('venue_profiles')
          .select('id, name, city, capacity')
          .eq('user_id', user.id)
          .single()

        if (venueError) setError(venueError.message)
        else setVenueProfile(data)
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

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
      <Shell>
        <DJDashboard userId={userId!} profile={djProfile} stats={stats} djProfileId={djProfile?.id ?? null} />
      </Shell>
    )
  }

  return (
    <Shell>
      <VenueDashboard userId={userId!} profile={venueProfile} stats={stats} venueProfileId={venueProfile?.id ?? null} />
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100svh', background: '#050505' }} className="flex flex-col">
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

function StatusBadge({ status }: { status: Booking['status'] }) {
  const map = {
    pending: { label: 'Beklemede', color: '#F59E0B' },
    accepted: { label: 'Kabul Edildi', color: '#00d4aa' },
    declined: { label: 'Reddedildi', color: '#EF4444' },
  }
  const { label, color } = map[status]
  return (
    <span
      style={{
        color,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        fontFamily: 'Inter, sans-serif',
      }}
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
    >
      {label}
    </span>
  )
}

function BookingRow({ booking }: { booking: Booking }) {
  const date = new Date(booking.event_date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const origin = booking.initiated_by === 'venue' ? 'Venue\'dan teklif' : 'Kendi teklifin'

  return (
    <div
      style={{ background: '#0d0d0d', border: '1px solid #1f1f1f' }}
      className="rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
    >
      <div className="flex flex-col gap-0.5">
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }} className="text-sm font-medium">
          {date}
        </span>
        <span style={{ fontFamily: 'Inter, sans-serif', color: '#ffffff50' }} className="text-xs">
          {origin}
        </span>
      </div>
      <StatusBadge status={booking.status} />
    </div>
  )
}

function DJDashboard({
  userId,
  profile,
  stats,
  djProfileId,
}: {
  userId: string
  profile: DJProfile | null
  stats: Stats
  djProfileId: string | null
}) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)

  useEffect(() => {
    if (!djProfileId) { setBookingsLoading(false); return }

    async function fetchBookings() {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, event_date, status, initiated_by, venue_id')
        .eq('dj_id', djProfileId)
        .order('created_at', { ascending: false })

      if (!error && data) setBookings(data as Booking[])
      setBookingsLoading(false)
    }

    fetchBookings()
  }, [djProfileId])

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
        {bookingsLoading ? (
          <div className="flex justify-center py-8">
            <div
              style={{ width: 24, height: 24, border: '2px solid #1f1f1f', borderTopColor: '#FF2D78', borderRadius: '50%' }}
              className="animate-spin"
            />
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState message="Henüz teklif yok." />
        ) : (
          <div className="flex flex-col gap-2">
            {bookings.map(b => <BookingRow key={b.id} booking={b} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function VenueDashboard({
  userId,
  profile,
  stats,
  venueProfileId,
}: {
  userId: string
  profile: VenueProfile | null
  stats: Stats
  venueProfileId: string | null
}) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)

  useEffect(() => {
    if (!venueProfileId) { setBookingsLoading(false); return }

    async function fetchBookings() {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, event_date, status, initiated_by, venue_id')
        .eq('venue_id', venueProfileId)
        .order('created_at', { ascending: false })

      if (!error && data) setBookings(data as Booking[])
      setBookingsLoading(false)
    }

    fetchBookings()
  }, [venueProfileId])

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
        {bookingsLoading ? (
          <div className="flex justify-center py-8">
            <div
              style={{ width: 24, height: 24, border: '2px solid #1f1f1f', borderTopColor: '#FF2D78', borderRadius: '50%' }}
              className="animate-spin"
            />
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState message="Henüz teklif yok." />
        ) : (
          <div className="flex flex-col gap-2">
            {bookings.map(b => <BookingRow key={b.id} booking={b} />)}
          </div>
        )}
      </div>
    </div>
  )
}
