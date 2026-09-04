import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const homeForRole = { student: '/student', recruiter: '/recruiter', admin: '/admin' }

export default function Nav() {
  const { isAuthenticated, role } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-baseline gap-1.5 font-display text-lg tracking-tight">
          <span className="text-blue">NextGen</span>
          <span className="text-magenta">·</span>
          <span className="text-magenta">CareerConnect</span>
        </Link>

        <nav className="hidden items-center gap-8 font-body text-sm text-slate md:flex">
          <a href="#drives" className="transition hover:text-ink">Drives</a>
          <a href="#roles" className="transition hover:text-ink">For you</a>
          <a href="#process" className="transition hover:text-ink">Process</a>
        </nav>

        {isAuthenticated ? (
          <Link
            to={homeForRole[role] || '/'}
            className="rounded-full bg-brand px-5 py-2.5 font-body text-sm font-semibold text-white shadow-sm shadow-violet/20 transition hover:opacity-90"
          >
            Go to dashboard
          </Link>
        ) : (
          <Link
            to="/login"
            className="rounded-full bg-brand px-5 py-2.5 font-body text-sm font-semibold text-white shadow-sm shadow-violet/20 transition hover:opacity-90"
          >
            Log in
          </Link>
        )}
      </div>
    </header>
  )
}
