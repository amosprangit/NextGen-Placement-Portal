import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = {
  student: [
    { to: '/student', label: 'Overview', end: true },
    { to: '/student/drives', label: 'Browse drives' },
    { to: '/student/applications', label: 'My applications' },
    { to: '/student/profile', label: 'Profile' },
  ],
  recruiter: [
    { to: '/recruiter', label: 'Overview', end: true },
    { to: '/recruiter/drives', label: 'My drives' },
    { to: '/recruiter/profile', label: 'Company profile' },
  ],
  admin: [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/students', label: 'Students' },
    { to: '/admin/recruiters', label: 'Recruiters' },
    { to: '/admin/drives', label: 'Drives' },
    { to: '/admin/profile', label: 'Profile' },
  ],
}

const ROLE_LABEL = {
  student: 'Student',
  recruiter: 'Recruiter',
  admin: 'Placement Cell',
}

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const items = NAV[role] || []

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border bg-white px-5 py-6 md:flex">
          <a href="/" className="mb-8 flex items-baseline gap-1.5 px-2 font-display text-lg tracking-tight">
            <span className="text-blue">NextGen</span>
            <span className="text-magenta">·</span>
            <span className="text-magenta">CareerConnect</span>
          </a>

          <p className="mb-3 px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate">
            {ROLE_LABEL[role]}
          </p>

          <nav className="flex flex-1 flex-col gap-1">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 font-body text-sm font-medium transition ${
                    isActive ? 'bg-brand-soft text-violet' : 'text-slate hover:bg-bg hover:text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto border-t border-border pt-4">
            <p className="truncate px-2 font-body text-sm font-medium text-ink">{user?.name}</p>
            <p className="truncate px-2 font-body text-xs text-slate">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="mt-3 w-full rounded-lg px-3 py-2 text-left font-body text-sm font-medium text-slate transition hover:bg-bg hover:text-ink"
            >
              Log out
            </button>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-border bg-white px-4 py-3 md:hidden">
          <a href="/" className="flex items-baseline gap-1.5 font-display text-base tracking-tight">
            <span className="text-blue">NextGen</span>
            <span className="text-magenta">CC</span>
          </a>
          <button onClick={handleLogout} className="font-body text-sm font-medium text-slate">
            Log out
          </button>
        </div>

        {/* Main content */}
        <main className="min-h-screen flex-1 px-5 py-8 pt-20 md:px-10 md:py-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-white md:hidden">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex-1 py-3 text-center font-body text-xs font-medium ${
                isActive ? 'text-violet' : 'text-slate'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
