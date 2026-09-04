import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { drivesApi } from '../../lib/resourceApi'
import { Card, Badge, Button, PageLoader, EmptyState, ErrorBanner } from '../../components/ui/primitives'
import { formatDate, DRIVE_STATUS_TONE } from '../../lib/format'

export default function RecruiterDrives() {
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await drivesApi.list({ limit: 100 })
        setDrives(res.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-magenta">Postings</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">My drives</h1>
        </div>
        <Button as={Link} to="/recruiter/drives/new">
          + Post a drive
        </Button>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <PageLoader />
      ) : drives.length === 0 ? (
        <EmptyState
          title="No drives yet"
          body="Post your first drive to start receiving applications."
          action={
            <Button as={Link} to="/recruiter/drives/new" className="mt-2">
              + Post a drive
            </Button>
          }
        />
      ) : (
        <Card className="divide-y divide-border">
          {drives.map((d) => (
            <div key={d._id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
              <div>
                <p className="font-body text-sm font-semibold text-ink">{d.title}</p>
                <p className="font-body text-xs text-slate">
                  {d.jobRole} · {d.applicationsCount || 0} applicants · Deadline {formatDate(d.applicationDeadline)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={DRIVE_STATUS_TONE[d.status]}>{d.status}</Badge>
                <Button as={Link} to={`/recruiter/drives/${d._id}`} variant="outline" className="px-4 py-2 text-xs">
                  Manage
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
