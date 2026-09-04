import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from './ui/primitives'

const homeForRole = {
  student: '/student',
  recruiter: '/recruiter',
  admin: '/admin',
}

export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, role: currentRole, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader label="Checking your session…" />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (role && currentRole !== role) {
    // Logged in, just as the wrong role — send them to their own dashboard
    // rather than a dead end.
    return <Navigate to={homeForRole[currentRole] || '/'} replace />
  }

  return children
}
