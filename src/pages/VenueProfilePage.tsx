import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Users,
  Calendar,
  RefreshCw,
  ExternalLink,
  Globe,
  Mail,
  Speaker,
  Lightbulb,
  Mic,
  Tv,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface VenueProfile {
  id: string
  user_id: string
  venue_name: string
  city: string
  capacity: number | null
  genres: string[]
  description: string | null
  equipment: string[] | null
  instagram: string | null
  website: string | null
  booking_email: string | null
  booking_count: number | null
  rebook_rate: number | null
  photo_url: string | null
}

const EQUIPMENT_ICONS: Record<string, React.ReactNode> = {
  soundsystem: <Speaker size={15} color="#888" />,
  lighting: <Lightbulb size={15} color="#888" />,
  microphone: <Mic size={15} color="#888" />,
  screen: <Tv size={15} color="#888" />,
}

function getEquipmentIcon(item: string) {
  const lower = item.toLowerCase()
  for (const key of Object.keys(EQUIPMENT_ICONS)) {
    if (lower.includes(key)) return EQUIPMENT_ICONS[key]
  }
  return <Speaker size={15} color="#888" />
}

function TrustSignal({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {icon}
      <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 600 }}>{value}</span>
      <span style={{ fontSize: 13, color: '#888' }}>{label}</span>
    </div>
  )
}

export default function VenueProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<VenueProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [equipmentOpen, setEquipmentOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user)
    })
  }, [])

  useEffect(() => {
    if (!id) return

    async function fetchProfile() {
      const { data, error: fetchError } = await supabase
        .from('venue_profiles')
        .select(
          'id, user_id, venue_name, city, capacity, genres, description, equipment, instagram, website, booking_email, booking_count, rebook_rate, photo_url'
        )
        .eq('id', id)
        .single()

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setProfile(data)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [id])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #FF2D78', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ color: '#888', fontFamily: 'Inter, sans-serif' }}>Mekan profili bulunamadı.</p>
        <button
          onClick={() => navigate(-1)}
          style={{ color: '#FF2D78', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14 }}
        >
          ← Geri dön
        </button>
      </div>
    )
  }

  const hasTrustSignals = profile.booking_count != null || profile.rebook_rate != null
  const hasEquipment = profile.equipment && profile.equipment.length > 0
  const hasSocial = profile.instagram || profile.website

  return (
    <div style={{ minHeight: '100vh', background: '#050505', fontFamily: 'Inter, sans-serif' }}>
      {/* HERO */}
      <section
        style={{
          background: 'linear-gradient(180deg, #050505 0%, #0d0d0d 100%)',
          borderBottom: '1px solid #1f1f1f',
          padding: '48px 24px 40px',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Top row: info + CTA */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
              {/* Left: info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 'clamp(28px, 6vw, 48px)',
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: '0 0 12px',
                    lineHeight: 1.1,
                  }}
                >
                  {profile.venue_name}
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={14} color="#888" />
                    <span style={{ color: '#888', fontSize: 14 }}>{profile.city}</span>
                  </div>
                  {profile.capacity != null && (
                    <>
                      <span style={{ color: '#333', fontSize: 14 }}>•</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={14} color="#888" />
                        <span style={{ color: '#888', fontSize: 14 }}>{profile.capacity.toLocaleString('tr-TR')} kişi</span>
                      </div>
                    </>
                  )}
                </div>

                {profile.genres && profile.genres.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                    {profile.genres.map((g) => (
                      <span
                        key={g}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#FF2D78',
                          border: '1px solid #FF2D78',
                          borderRadius: 4,
                          padding: '3px 8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  style={{
                    background: '#FF2D78',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 28px',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Space Grotesk, sans-serif',
                    letterSpacing: '-0.01em',
                  }}
                  onClick={() => {
                    /* booking flow — TBD */
                  }}
                >
                  Booking Talebi Gönder
                </button>
              </div>

              {/* Right: venue photo or initials */}
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 12,
                  background: '#1f1f1f',
                  border: '1px solid #1f1f1f',
                  overflow: 'hidden',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {profile.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt={profile.venue_name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 36, color: '#FF2D78', fontWeight: 700 }}>
                    {profile.venue_name
                      .split(' ')
                      .map((w: string) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Trust signals row */}
            {hasTrustSignals && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px 28px',
                  paddingTop: 20,
                  borderTop: '1px solid #1f1f1f',
                }}
              >
                {profile.booking_count != null && (
                  <TrustSignal
                    icon={<Calendar size={14} color="#00d4aa" />}
                    value={`${profile.booking_count}`}
                    label="tamamlanan booking"
                  />
                )}
                {profile.rebook_rate != null && (
                  <TrustSignal
                    icon={<RefreshCw size={14} color="#00d4aa" />}
                    value={`%${profile.rebook_rate}`}
                    label="tekrar davet oranı"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* INFO SECTION */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Description */}
        {profile.description && (
          <div
            style={{
              background: '#0d0d0d',
              border: '1px solid #1f1f1f',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 600, color: '#ffffff', margin: '0 0 12px' }}>
              Mekan Hakkında
            </h2>
            <p style={{ color: '#aaa', fontSize: 15, lineHeight: 1.7, margin: 0 }}>{profile.description}</p>
          </div>
        )}

        {/* Equipment — accordion */}
        {hasEquipment && (
          <div
            style={{
              background: '#0d0d0d',
              border: '1px solid #1f1f1f',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setEquipmentOpen((v) => !v)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 24,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#ffffff',
              }}
            >
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 600 }}>
                Ekipman
              </span>
              {equipmentOpen ? <ChevronUp size={18} color="#888" /> : <ChevronDown size={18} color="#888" />}
            </button>
            {equipmentOpen && (
              <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {profile.equipment!.map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {getEquipmentIcon(item)}
                    <span style={{ color: '#aaa', fontSize: 14 }}>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Social + Website */}
        {hasSocial && (
          <div
            style={{
              background: '#0d0d0d',
              border: '1px solid #1f1f1f',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 600, color: '#ffffff', margin: '0 0 16px' }}>
              Bağlantılar
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: 14,
                    padding: '10px 14px',
                    background: '#151515',
                    border: '1px solid #1f1f1f',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  <ExternalLink size={16} />
                  <span>@{profile.instagram.replace(/^@/, '')}</span>
                  <ExternalLink size={13} color="#555" style={{ marginLeft: 'auto' }} />
                </a>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: 14,
                    padding: '10px 14px',
                    background: '#151515',
                    border: '1px solid #1f1f1f',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  <Globe size={16} color="#888" />
                  <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink size={13} color="#555" style={{ marginLeft: 'auto' }} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Booking email — giriş yapmış kullanıcıya göster */}
        {isLoggedIn && profile.booking_email && (
          <div
            style={{
              background: '#0d0d0d',
              border: '1px solid #1f1f1f',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 600, color: '#ffffff', margin: '0 0 16px' }}>
              İletişim
            </h2>
            <a
              href={`mailto:${profile.booking_email}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: 14,
                padding: '10px 14px',
                background: '#151515',
                border: '1px solid #1f1f1f',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <Mail size={16} color="#00d4aa" />
              <span>{profile.booking_email}</span>
            </a>
          </div>
        )}
      </section>
    </div>
  )
}
