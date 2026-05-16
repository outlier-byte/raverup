import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, LogIn, Compass } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <>
      <style>{`
        .nav-mid { display: flex; }
        .nav-mid-icon { display: none; }
        .nav-btn-label { display: inline; }
        @media (max-width: 640px) {
          .nav-mid { display: none; }
          .nav-mid-icon { display: flex; }
          .nav-btn-label { display: none; }
        }
      `}</style>
      <nav
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: 56,
          background: '#050505',
          borderBottom: '1px solid #1f1f1f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 20,
            fontWeight: 700,
            color: '#FF2D78',
            textDecoration: 'none',
          }}
        >
          RaverUp
        </Link>

        {/* Middle */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <Link
            to="/discover"
            className="nav-mid"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#aaa', textDecoration: 'none', alignItems: 'center', gap: 6, transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}
          >
            Keşfet
          </Link>
          <Link
            to="/discover"
            className="nav-mid-icon"
            style={{ color: '#aaa', alignItems: 'center', textDecoration: 'none' }}
          >
            <Compass size={20} />
          </Link>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <>
              <Link
                to="/dashboard"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
                  color: '#ffffff', textDecoration: 'none',
                  background: '#1f1f1f', border: '1px solid #333',
                  borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                }}
              >
                <LayoutDashboard size={14} />
                <span className="nav-btn-label">Dashboard</span>
              </Link>
              <button
                onClick={handleSignOut}
                title="Çıkış"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'Inter, sans-serif', fontSize: 13,
                  color: '#888', background: 'none',
                  border: '1px solid #1f1f1f', borderRadius: 8,
                  padding: '6px 12px', cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#333' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#1f1f1f' }}
              >
                <LogOut size={14} />
                <span className="nav-btn-label">Çıkış</span>
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, fontWeight: 700,
                color: '#ffffff', textDecoration: 'none',
                background: '#FF2D78', borderRadius: 8, padding: '6px 14px',
              }}
            >
              <LogIn size={14} />
              <span className="nav-btn-label">Giriş Yap</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  )
}
