import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { recruitersApi, drivesApi } from '../../lib/resourceApi'
import { Card, Badge, Button, PageLoader, ErrorBanner } from '../../components/ui/primitives'
import StatCard from '../../components/StatCard'
import { formatDate, DRIVE_STATUS_TONE } from '../../lib/format'

export default function RecruiterOverview() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [profileRes, drivesRes] = await Promise.all([
          recruitersApi.me(),
          drivesApi.list({ limit: 50 }),
        ])
        if (cancelled) return
        setProfile(profileRes)
        setDrives(drivesRes.data)
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

  const openCount = drives.filter((d) => d.status === 'open').length
  const totalApplicants = drives.reduce((sum, d) => sum + (d.applicationsCount || 0), 0)
  const totalSelected = drives.reduce((sum, d) => sum + (d.selectedCount || 0), 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-magenta">Overview</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Welcome back, {user?.name?.split(' ')[0]}.</h1>
        </div>
        <Button as={Link} to="/recruiter/drives/new">
          + Post a drive
        </Button>
      </div>

      <ErrorBanner message={error} />

      {profile && !profile.isApproved && (
        <Card className="border-amber/30 bg-amber/5 px-6 py-4">
          <p className="font-body text-sm text-ink">
            Your account is still pending approval from the placement cell. You can prepare a draft
            drive now — it'll be reviewed once approved.
          </p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open drives" value={openCount} />
        <StatCard label="Total applicants" value={totalApplicants} />
        <StatCard label="Selected" value={totalSelected} />
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Your drives</h2>
          <Link to="/recruiter/drives" className="font-body text-sm font-medium text-violet hover:underline">
            View all
          </Link>
        </div>
        {drives.length === 0 ? (
          <p className="font-body text-sm text-slate">You haven't posted a drive yet.</p>
        ) : (
          <ul className="space-y-4">
            {drives.slice(0, 5).map((d) => (
              <li key={d._id} className="flex items-center justify-between gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-body text-sm font-semibold text-ink">{d.title}</p>
                  <p className="font-body text-xs text-slate">
                    {d.applicationsCount || 0} applicants · Deadline {formatDate(d.applicationDeadline)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={DRIVE_STATUS_TONE[d.status]}>{d.status}</Badge>
                  <Button as={Link} to={`/recruiter/drives/${d._id}`} variant="outline" className="px-3 py-1.5 text-xs">
                    Manage
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
