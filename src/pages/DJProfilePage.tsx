import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Music,
  Clock,
  CheckCircle,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface DJProfile {
  id: string
  user_id: string
  stage_name: string
  city: string
  genres: string[]
  bio: string | null
  bpm_min: number | null
  bpm_max: number | null
  photo_url: string | null
  mix_soundcloud: string | null
  mix_mixcloud: string | null
  rider_notes: string | null
  instagram: string | null
  completion_rate: number | null
  response_time_hours: number | null
  booking_count: number | null
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      style={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: '#1f1f1f',
        border: '2px solid #FF2D78',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {url ? (
        <img
          src={url}
          alt={name}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 36, color: '#FF2D78', fontWeight: 700 }}>
          {initials}
        </span>
      )}
    </div>
  )
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

export default function DJProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<DJProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [riderOpen, setRiderOpen] = useState(false)

  useEffect(() => {
    if (!id) return

    async function fetchProfile() {
      const { data, error: fetchError } = await supabase
        .from('dj_profiles')
        .select(
          'id, user_id, stage_name, city, genres, bio, bpm_min, bpm_max, photo_url, mix_soundcloud, mix_mixcloud, rider_notes, instagram, completion_rate, response_time_hours, booking_count'
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
        <p style={{ color: '#888', fontFamily: 'Inter, sans-serif' }}>DJ profili bulunamadı.</p>
        <button
          onClick={() => navigate(-1)}
          style={{ color: '#FF2D78', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14 }}
        >
          ← Geri dön
        </button>
      </div>
    )
  }

  const hasBpm = profile.bpm_min != null || profile.bpm_max != null
  const hasMix = profile.mix_soundcloud || profile.mix_mixcloud
  const hasTrustSignals = profile.completion_rate != null || profile.response_time_hours != null || profile.booking_count != null

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
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
            }}
            className="dj-hero-inner"
          >
            {/* Top row: info + avatar */}
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
                  {profile.stage_name}
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                  <MapPin size={14} color="#888" />
                  <span style={{ color: '#888', fontSize: 14 }}>{profile.city}</span>
                </div>

                {profile.genres && profile.genres.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
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

                {hasBpm && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                    <Music size={14} color="#888" />
                    <span style={{ color: '#aaa', fontSize: 13 }}>
                      {profile.bpm_min != null && profile.bpm_max != null
                        ? `${profile.bpm_min}–${profile.bpm_max} BPM`
                        : profile.bpm_min != null
                        ? `${profile.bpm_min}+ BPM`
                        : `–${profile.bpm_max} BPM`}
                    </span>
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
                  Teklif Gönder
                </button>
              </div>

              {/* Right: avatar */}
              <Avatar url={profile.photo_url} name={profile.stage_name} />
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
                {profile.completion_rate != null && (
                  <TrustSignal
                    icon={<CheckCircle size={14} color="#00d4aa" />}
                    value={`%${profile.completion_rate}`}
                    label="tamamlanma oranı"
                  />
                )}
                {profile.response_time_hours != null && (
                  <TrustSignal
                    icon={<Clock size={14} color="#00d4aa" />}
                    value={`${profile.response_time_hours}s içinde`}
                    label="ortalama yanıt"
                  />
                )}
                {profile.booking_count != null && (
                  <TrustSignal
                    icon={<Calendar size={14} color="#00d4aa" />}
                    value={`${profile.booking_count}`}
                    label="tamamlanan booking"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* INFO GRID */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Bio */}
        {profile.bio && (
          <div
            style={{
              background: '#0d0d0d',
              border: '1px solid #1f1f1f',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 600, color: '#ffffff', margin: '0 0 12px' }}>
              Hakkında
            </h2>
            <p style={{ color: '#aaa', fontSize: 15, lineHeight: 1.7, margin: 0 }}>{profile.bio}</p>
          </div>
        )}

        {/* Mix links */}
        {hasMix && (
          <div
            style={{
              background: '#0d0d0d',
              border: '1px solid #1f1f1f',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 600, color: '#ffffff', margin: '0 0 16px' }}>
              Mixler
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {profile.mix_soundcloud && (
                <a
                  href={profile.mix_soundcloud}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
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
                  {/* SoundCloud icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M1 17.5A2.5 2.5 0 003.5 20H18a4 4 0 000-8 5 5 0 00-9.9-1A2.5 2.5 0 001 13.5v4z"
                      stroke="#FF5500"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>SoundCloud</span>
                  <ExternalLink size={13} color="#555" style={{ marginLeft: 'auto' }} />
                </a>
              )}
              {profile.mix_mixcloud && (
                <a
                  href={profile.mix_mixcloud}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
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
                  {/* Mixcloud icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
                      stroke="#5000FF"
                      strokeWidth="1.5"
                    />
                    <path d="M9 15V9l7 3-7 3z" fill="#5000FF" />
                  </svg>
                  <span>Mixcloud</span>
                  <ExternalLink size={13} color="#555" style={{ marginLeft: 'auto' }} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Rider notes — accordion */}
        {profile.rider_notes && (
          <div
            style={{
              background: '#0d0d0d',
              border: '1px solid #1f1f1f',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setRiderOpen((v) => !v)}
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
                Teknik Rider
              </span>
              {riderOpen ? <ChevronUp size={18} color="#888" /> : <ChevronDown size={18} color="#888" />}
            </button>
            {riderOpen && (
              <div style={{ padding: '0 24px 24px' }}>
                <p style={{ color: '#aaa', fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {profile.rider_notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instagram */}
        {profile.instagram && (
          <div
            style={{
              background: '#0d0d0d',
              border: '1px solid #1f1f1f',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 600, color: '#ffffff', margin: '0 0 16px' }}>
              Sosyal Medya
            </h2>
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
              <ExternalLink size={13} color="#555" />
            </a>
          </div>
        )}
      </section>
    </div>
  )
}
