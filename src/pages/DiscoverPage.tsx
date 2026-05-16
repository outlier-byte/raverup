import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Users, Music } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface DJCard {
  id: string
  name: string
  city: string
  genre: string[]
  bpm_min: number | null
  bpm_max: number | null
  booking_count: number | null
}

interface VenueCard {
  id: string
  name: string
  city: string
  capacity: number | null
  preferred_genres: string[]
}

const ALL_GENRES = [
  'Techno', 'House', 'Trance', 'Drum & Bass', 'Jungle', 'Ambient',
  'Minimal', 'Deep House', 'Tech House', 'Hardstyle', 'Psytrance',
  'Electro', 'Industrial', 'Noise', 'Hip-Hop', 'Funk', 'Disco',
]

function Skeleton() {
  return (
    <div className="rounded-xl border border-[#1f1f1f] bg-[#0d0d0d] overflow-hidden animate-pulse">
      <div className="h-48 bg-[#1a1a1a]" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[#1a1a1a] rounded w-2/3" />
        <div className="h-3 bg-[#1a1a1a] rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 bg-[#1a1a1a] rounded-full w-16" />
          <div className="h-6 bg-[#1a1a1a] rounded-full w-16" />
        </div>
        <div className="h-8 bg-[#1a1a1a] rounded w-full mt-2" />
      </div>
    </div>
  )
}

function PhotoPlaceholder({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)',
      }}
    >
      <span
        className="text-5xl font-bold select-none"
        style={{ color: '#FF2D78', fontFamily: 'Space Grotesk, sans-serif' }}
      >
        {initials}
      </span>
    </div>
  )
}

function DJCardView({ dj }: { dj: DJCard }) {
  const navigate = useNavigate()

  return (
    <div
      className="rounded-xl border border-[#1f1f1f] bg-[#0d0d0d] overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:border-[#FF2D78] hover:scale-[1.02]"
      onClick={() => navigate(`/dj/${dj.id}`)}
    >
      <div className="h-48 overflow-hidden flex-shrink-0">
        <PhotoPlaceholder name={dj.name} />
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3
          className="text-white font-bold text-lg leading-tight"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {dj.name}
        </h3>

        {dj.city && (
          <div className="flex items-center gap-1 text-[#888] text-sm">
            <MapPin size={13} />
            <span>{dj.city}</span>
          </div>
        )}

        {dj.genre?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {dj.genre.slice(0, 3).map((g) => (
              <span
                key={g}
                className="text-xs px-2 py-0.5 rounded-full border text-[#FF2D78]"
                style={{ borderColor: '#FF2D78' }}
              >
                {g}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 text-[#888] text-xs mt-auto pt-1">
          {dj.bpm_min != null && dj.bpm_max != null && (
            <span className="flex items-center gap-1">
              <Music size={12} />
              {dj.bpm_min}–{dj.bpm_max} BPM
            </span>
          )}
          {dj.booking_count != null && dj.booking_count > 0 && (
            <span>{dj.booking_count} booking</span>
          )}
        </div>

        <button
          className="mt-2 w-full py-1.5 rounded-lg text-sm font-medium text-white border border-[#FF2D78] hover:bg-[#FF2D78] transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/dj/${dj.id}`)
          }}
        >
          Profili Gör
        </button>
      </div>
    </div>
  )
}

function VenueCardView({ venue }: { venue: VenueCard }) {
  const navigate = useNavigate()

  return (
    <div
      className="rounded-xl border border-[#1f1f1f] bg-[#0d0d0d] overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:border-[#FF2D78] hover:scale-[1.02]"
      onClick={() => navigate(`/venue/${venue.id}`)}
    >
      <div className="h-48 overflow-hidden flex-shrink-0">
        <PhotoPlaceholder name={venue.name} />
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3
          className="text-white font-bold text-lg leading-tight"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {venue.name}
        </h3>

        {venue.city && (
          <div className="flex items-center gap-1 text-[#888] text-sm">
            <MapPin size={13} />
            <span>{venue.city}</span>
          </div>
        )}

        {venue.preferred_genres?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {venue.preferred_genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="text-xs px-2 py-0.5 rounded-full border text-[#FF2D78]"
                style={{ borderColor: '#FF2D78' }}
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {venue.capacity != null && (
          <div className="flex items-center gap-1 text-[#888] text-xs mt-auto pt-1">
            <Users size={12} />
            <span>{venue.capacity} kişi kapasitesi</span>
          </div>
        )}

        <button
          className="mt-2 w-full py-1.5 rounded-lg text-sm font-medium text-white border border-[#FF2D78] hover:bg-[#FF2D78] transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/venue/${venue.id}`)
          }}
        >
          Profili Gör
        </button>
      </div>
    </div>
  )
}

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<'dj' | 'venue'>('dj')
  const [djs, setDjs] = useState<DJCard[]>([])
  const [venues, setVenues] = useState<VenueCard[]>([])
  const [loading, setLoading] = useState(true)

  const [cityFilter, setCityFilter] = useState('')
  const [genreFilter, setGenreFilter] = useState('')
  const [bpmRange, setBpmRange] = useState<[number, number]>([60, 200])

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)

      const [djRes, venueRes] = await Promise.all([
        supabase
          .from('dj_profiles')
          .select('id, name, city, genre, bpm_min, bpm_max, booking_count'),
        supabase
          .from('venue_profiles')
          .select('id, name, city, capacity, preferred_genres'),
      ])

      if (djRes.data) setDjs(djRes.data as DJCard[])
      if (venueRes.data) setVenues(venueRes.data as VenueCard[])

      setLoading(false)
    }

    fetchAll()
  }, [])

  const filteredDjs = useMemo(() => {
    return djs.filter((dj) => {
      if (cityFilter && !dj.city?.toLowerCase().includes(cityFilter.toLowerCase())) return false
      if (genreFilter && !dj.genre?.some((g) => g.toLowerCase() === genreFilter.toLowerCase())) return false
      if (dj.bpm_min != null && dj.bpm_max != null) {
        if (dj.bpm_max < bpmRange[0] || dj.bpm_min > bpmRange[1]) return false
      }
      return true
    })
  }, [djs, cityFilter, genreFilter, bpmRange])

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      if (cityFilter && !venue.city?.toLowerCase().includes(cityFilter.toLowerCase())) return false
      if (genreFilter && !venue.preferred_genres?.some((g) => g.toLowerCase() === genreFilter.toLowerCase())) return false
      return true
    })
  }, [venues, cityFilter, genreFilter])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#050505', color: '#fff' }}>
      {/* Header */}
      <div className="border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Keşfet
          </h1>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg p-1 w-fit">
            {(['dj', 'venue'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'text-white'
                    : 'text-[#888] hover:text-white'
                }`}
                style={
                  activeTab === tab
                    ? { backgroundColor: '#FF2D78' }
                    : {}
                }
              >
                {tab === 'dj' ? 'DJ\'ler' : 'Venue\'lar'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Filters */}
      <div
        className="sticky top-0 z-10 border-b border-[#1f1f1f]"
        style={{ backgroundColor: '#050505' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Şehir ara..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#FF2D78] w-40"
          />

          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF2D78] cursor-pointer"
            style={{ color: genreFilter ? '#fff' : '#555' }}
          >
            <option value="">Tüm Türler</option>
            {ALL_GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {activeTab === 'dj' && (
            <div className="flex items-center gap-2 text-sm text-[#888]">
              <span>BPM</span>
              <span className="text-[#FF2D78]">{bpmRange[0]}</span>
              <input
                type="range"
                min={60}
                max={200}
                value={bpmRange[0]}
                onChange={(e) =>
                  setBpmRange([Math.min(Number(e.target.value), bpmRange[1] - 5), bpmRange[1]])
                }
                className="w-24 accent-[#FF2D78] cursor-pointer"
              />
              <span>–</span>
              <input
                type="range"
                min={60}
                max={200}
                value={bpmRange[1]}
                onChange={(e) =>
                  setBpmRange([bpmRange[0], Math.max(Number(e.target.value), bpmRange[0] + 5)])
                }
                className="w-24 accent-[#FF2D78] cursor-pointer"
              />
              <span className="text-[#FF2D78]">{bpmRange[1]}</span>
            </div>
          )}

          {(cityFilter || genreFilter) && (
            <button
              onClick={() => { setCityFilter(''); setGenreFilter('') }}
              className="text-xs text-[#888] hover:text-[#FF2D78] cursor-pointer transition-colors"
            >
              Filtreleri temizle
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} />
            ))}
          </div>
        ) : activeTab === 'dj' ? (
          filteredDjs.length === 0 ? (
            <div className="text-center text-[#555] py-20 text-sm">Henüz kayıt yok</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDjs.map((dj) => (
                <DJCardView key={dj.id} dj={dj} />
              ))}
            </div>
          )
        ) : filteredVenues.length === 0 ? (
          <div className="text-center text-[#555] py-20 text-sm">Henüz kayıt yok</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVenues.map((venue) => (
              <VenueCardView key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
