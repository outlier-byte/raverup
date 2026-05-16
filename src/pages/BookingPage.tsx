import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, Clock, DollarSign, MessageSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'

const DURATION_OPTIONS = [2, 3, 4, 6, 8]

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0d0d0d',
  border: '1px solid #1f1f1f',
  borderRadius: 8,
  color: '#ffffff',
  fontFamily: 'Inter, sans-serif',
  fontSize: 15,
  padding: '12px 14px',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  color: '#888',
  marginBottom: 8,
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          {icon}
          {label}
        </span>
      </label>
      {children}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1f1f1f' }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#888' }}>{label}</span>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#ffffff', fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
      {[1, 2].map((s) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: step >= s ? '#FF2D78' : '#1f1f1f',
              border: `2px solid ${step >= s ? '#FF2D78' : '#333'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: step >= s ? '#ffffff' : '#555',
            }}
          >
            {s}
          </div>
          {s === 1 && (
            <div style={{ width: 40, height: 2, background: step === 2 ? '#FF2D78' : '#1f1f1f', borderRadius: 1 }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function BookingPage() {
  const { djId } = useParams<{ djId: string }>()
  const navigate = useNavigate()

  const [step, setStep] = useState<1 | 2>(1)
  const [djName, setDjName] = useState('')
  const [venueId, setVenueId] = useState<string | null>(null)
  const [initLoading, setInitLoading] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  const [eventDate, setEventDate] = useState('')
  const [duration, setDuration] = useState(4)
  const [fee, setFee] = useState('')
  const [message, setMessage] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const todayIso = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/auth', { replace: true }); return }

      const [djRes, venueRes] = await Promise.all([
        supabase
          .from('dj_profiles')
          .select('name')
          .eq('id', djId)
          .single(),
        supabase
          .from('venue_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle(),
      ])

      if (djRes.error || !djRes.data) {
        setInitError('DJ bulunamadı.')
        setInitLoading(false)
        return
      }

      // if (!venueRes.data) {
      //   setInitError('Bu sayfaya sadece venue hesapları erişebilir.')
      //   setInitLoading(false)
      //   return
      // }

      setDjName(djRes.data.name)
      setVenueId(venueRes.data?.id ?? null)
      setInitLoading(false)
    }

    init()
  }, [djId, navigate])

  function handleContinue() {
    if (!eventDate) return
    setStep(2)
  }

  async function handleSubmit() {
    console.log('booking submit başladı')
    console.log('venue_id:', venueId)
    console.log('dj_id:', djId)

    if (!venueId || !djId || !eventDate) return

    setSubmitting(true)
    setSubmitError(null)

    const { error } = await supabase.from('bookings').insert({
      dj_id: djId,
      venue_id: venueId,
      initiated_by: 'venue',
      event_date: eventDate,
      duration_hours: duration,
      fee_agreed: fee ? parseInt(fee, 10) : null,
      message: message || null,
      status: 'pending',
    })

    if (error) {
      setSubmitError(error.message)
      setSubmitting(false)
      return
    }

    navigate('/dashboard')
  }

  const formattedDate = eventDate
    ? new Date(eventDate + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  if (initLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #FF2D78', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (initError) {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ color: '#888', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: '0 24px' }}>{initError}</p>
        <button
          onClick={() => navigate(-1)}
          style={{ color: '#FF2D78', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14 }}
        >
          ← Geri dön
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px 80px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 700, color: '#ffffff', margin: '0 0 6px' }}>
            Teklif Gönder
          </h1>
          <p style={{ fontSize: 14, color: '#888', margin: 0 }}>{djName}</p>
        </div>

        <StepIndicator step={step} />

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <Field icon={<Calendar size={14} color="#888" />} label="Etkinlik tarihi">
              <input
                type="date"
                min={todayIso}
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                style={{ ...inputStyle, colorScheme: 'dark' }}
              />
            </Field>

            <Field icon={<Clock size={14} color="#888" />} label="Süre">
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
              >
                {DURATION_OPTIONS.map((h) => (
                  <option key={h} value={h}>{h} saat</option>
                ))}
              </select>
            </Field>

            <Field icon={<DollarSign size={14} color="#888" />} label="Teklif ücreti (opsiyonel)">
              <input
                type="number"
                min={0}
                placeholder="₺ tutar"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                style={inputStyle}
              />
            </Field>

            <Field icon={<MessageSquare size={14} color="#888" />} label={`Not (${message.length}/500)`}>
              <textarea
                maxLength={500}
                rows={4}
                placeholder="Etkinlik hakkında bilgi, beklentiler..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
              />
            </Field>

            <button
              onClick={handleContinue}
              disabled={!eventDate}
              style={{
                marginTop: 4,
                width: '100%',
                background: eventDate ? '#FF2D78' : '#2a1018',
                color: eventDate ? '#ffffff' : '#555',
                border: 'none',
                borderRadius: 10,
                padding: '14px 24px',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: eventDate ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s',
              }}
            >
              Devam Et →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div
              style={{
                background: '#0d0d0d',
                border: '1px solid #1f1f1f',
                borderRadius: 12,
                padding: '4px 20px 8px',
                marginBottom: 24,
              }}
            >
              <SummaryRow label="DJ" value={djName} />
              <SummaryRow label="Tarih" value={formattedDate} />
              <SummaryRow label="Süre" value={`${duration} saat`} />
              <SummaryRow label="Ücret" value={fee ? `₺${parseInt(fee, 10).toLocaleString('tr-TR')}` : 'Belirtilmedi'} />
              {message && (
                <div style={{ padding: '12px 0' }}>
                  <span style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Not</span>
                  <span style={{ fontSize: 14, color: '#aaa', lineHeight: 1.6 }}>{message}</span>
                </div>
              )}
            </div>

            {submitError && (
              <p style={{ fontSize: 13, color: '#FF2D78', marginBottom: 16, textAlign: 'center' }}>{submitError}</p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  width: '100%',
                  background: submitting ? '#2a1018' : '#FF2D78',
                  color: submitting ? '#555' : '#ffffff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px 24px',
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: 'Space Grotesk, sans-serif',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                {submitting ? 'Gönderiliyor...' : 'Teklif Gönder'}
              </button>

              <button
                onClick={() => { setStep(1); setSubmitError(null) }}
                disabled={submitting}
                style={{
                  width: '100%',
                  background: 'none',
                  color: '#888',
                  border: '1px solid #1f1f1f',
                  borderRadius: 10,
                  padding: '12px 24px',
                  fontSize: 14,
                  fontFamily: 'Inter, sans-serif',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                ← Geri dön
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
