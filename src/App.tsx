import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import DiscoverPage from './pages/DiscoverPage'
import DJProfilePage from './pages/DJProfilePage'
import VenueProfilePage from './pages/VenueProfilePage'
import DashboardPage from './pages/DashboardPage'
import OnboardingPage from './pages/OnboardingPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <>{children}</> : <Navigate to="/auth" replace />
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<GuestRoute><AuthPage /></GuestRoute>} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/dj/:id" element={<DJProfilePage />} />
        <Route path="/venue/:id" element={<VenueProfilePage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
