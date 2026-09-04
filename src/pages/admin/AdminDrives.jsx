import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { drivesApi } from '../../lib/resourceApi'
import { Card, Badge, Button, Select, PageLoader, EmptyState, ErrorBanner } from '../../components/ui/primitives'
import { formatDate, DRIVE_STATUS_TONE } from '../../lib/format'

const STATUS_OPTIONS = ['draft', 'upcoming', 'open', 'closed', 'completed', 'cancelled']

export default function AdminDrives() {
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = { limit: 100 }
      if (statusFilter) params.status = statusFilter
      const res = await drivesApi.list(params)
      setDrives(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const handleApprove = async (id) => {
    setBusyId(id)
    try {
      await drivesApi.updateStatus(id, 'upcoming')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this drive and all its applications? This cannot be undone.')) return
    setBusyId(id)
    try {
      await drivesApi.remove(id)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const pendingCount = drives.filter((d) => d.status === 'draft').length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-magenta">Oversight</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">All drives</h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant={statusFilter === 'draft' ? 'primary' : 'outline'}
            className="px-4 py-2 text-xs"
            onClick={() => setStatusFilter(statusFilter === 'draft' ? '' : 'draft')}
          >
            Pending approval{pendingCount > 0 ? ` (${pendingCount})` : ''}
          </Button>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="!py-2 text-xs">
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <PageLoader />
      ) : drives.length === 0 ? (
        <EmptyState title="No drives found" body="Try a different filter, or wait for recruiters to post one." />
      ) : (
        <Card className="divide-y divide-border">
          {drives.map((d) => (
            <div key={d._id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
              <Link to={`/admin/drives/${d._id}`} className="min-w-[200px] flex-1">
                <p className="font-body text-sm font-semibold text-ink hover:underline">{d.title}</p>
                <p className="font-body text-xs text-slate">
                  {d.company} · {d.applicationsCount || 0} applicants · Deadline {formatDate(d.applicationDeadline)}
                </p>
              </Link>
              <div className="flex items-center gap-3">
                <Badge tone={DRIVE_STATUS_TONE[d.status]}>{d.status}</Badge>
                {d.status === 'draft' && (
                  <Button className="px-3 py-1.5 text-xs" disabled={busyId === d._id} onClick={() => handleApprove(d._id)}>
                    Approve
                  </Button>
                )}
                <Button as={Link} to={`/admin/drives/${d._id}`} variant="outline" className="px-3 py-1.5 text-xs">
                  View
                </Button>
                <Button
                  variant="danger"
                  className="px-3 py-1.5 text-xs"
                  disabled={busyId === d._id}
                  onClick={() => handleDelete(d._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
