import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { studentsApi, drivesApi, applicationsApi } from '../../lib/resourceApi'
import { Card, Badge, Button, PageLoader, ErrorBanner } from '../../components/ui/primitives'
import StatCard from '../../components/StatCard'
import { formatDate, APPLICATION_STATUS_TONE, humanizeStatus } from '../../lib/format'

export default function StudentOverview() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [drives, setDrives] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [profileRes, drivesRes, appsRes] = await Promise.all([
          studentsApi.me(),
          drivesApi.list({ status: 'open', eligibleOnly: 'true', limit: 4 }),
          applicationsApi.mine({ limit: 5 }),
        ])
        if (cancelled) return
        setProfile(profileRes)
        setDrives(drivesRes.data)
        setApplications(appsRes.data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <PageLoader />

  const shortlisted = applications.filter((a) => ['shortlisted', 'interview_scheduled'].includes(a.status)).length

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-magenta">Overview</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Welcome back, {user?.name?.split(' ')[0]}.</h1>
      </div>

      <ErrorBanner message={error} />

      {profile && !profile.isProfileComplete && (
        <Card className="border-amber/30 bg-amber/5 px-6 py-4">
          <p className="font-body text-sm text-ink">
            Your profile is incomplete — add your resume and academic details so you show up as eligible for drives.
          </p>
          <Link to="/student/profile/edit" className="mt-2 inline-block font-body text-sm font-semibold text-violet hover:underline">
            Complete profile →
          </Link>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Applications" value={applications.length} />
        <StatCard label="In review" value={shortlisted} />
        <StatCard label="CGPA" value={profile?.cgpa ?? '—'} />
        <StatCard
          label="Placement status"
          value={profile?.placementStatus === 'placed' ? 'Placed' : 'Unplaced'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Eligible open drives</h2>
            <Link to="/student/drives" className="font-body text-sm font-medium text-violet hover:underline">
              View all
            </Link>
          </div>
          {drives.length === 0 ? (
            <p className="font-body text-sm text-slate">No eligible open drives right now — check back soon.</p>
          ) : (
            <ul className="space-y-4">
              {drives.map((d) => (
                <li key={d._id} className="flex items-center justify-between gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-body text-sm font-semibold text-ink">{d.company}</p>
                    <p className="font-body text-xs text-slate">{d.jobRole} · {d.ctc?.display}</p>
                  </div>
                  <Button as={Link} to={`/student/drives/${d._id}`} variant="outline" className="px-4 py-2 text-xs">
                    View
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Recent applications</h2>
            <Link to="/student/applications" className="font-body text-sm font-medium text-violet hover:underline">
              View all
            </Link>
          </div>
          {applications.length === 0 ? (
            <p className="font-body text-sm text-slate">You haven't applied to any drives yet.</p>
          ) : (
            <ul className="space-y-4">
              {applications.map((a) => (
                <li key={a._id} className="flex items-center justify-between gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-body text-sm font-semibold text-ink">{a.drive?.company}</p>
                    <p className="font-body text-xs text-slate">Applied {formatDate(a.createdAt)}</p>
                  </div>
                  <Badge tone={APPLICATION_STATUS_TONE[a.status]}>{humanizeStatus(a.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
