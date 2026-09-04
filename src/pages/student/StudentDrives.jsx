import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { drivesApi } from '../../lib/resourceApi'
import { Card, Badge, Button, Select, PageLoader, EmptyState, ErrorBanner } from '../../components/ui/primitives'
import { formatDate, DRIVE_STATUS_TONE } from '../../lib/format'

export default function StudentDrives() {
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ eligibleOnly: 'true', jobType: '' })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const params = { limit: 50 }
        if (filters.eligibleOnly === 'true') params.eligibleOnly = 'true'
        if (filters.jobType) params.jobType = filters.jobType
        const res = await drivesApi.list(params)
        if (!cancelled) setDrives(res.data)
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
  }, [filters])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-magenta">Live</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Browse drives</h1>
        </div>
        <div className="flex gap-3">
          <Select
            value={filters.eligibleOnly}
            onChange={(e) => setFilters((f) => ({ ...f, eligibleOnly: e.target.value }))}
            className="!py-2 text-xs"
          >
            <option value="true">Eligible for me</option>
            <option value="false">All drives</option>
          </Select>
          <Select
            value={filters.jobType}
            onChange={(e) => setFilters((f) => ({ ...f, jobType: e.target.value }))}
            className="!py-2 text-xs"
          >
            <option value="">All types</option>
            <option value="full-time">Full-time</option>
            <option value="internship">Internship</option>
            <option value="ppo">PPO</option>
          </Select>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <PageLoader />
      ) : drives.length === 0 ? (
        <EmptyState
          title="No drives match this filter"
          body="Try switching to 'All drives', or check back once the placement cell publishes more."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {drives.map((d) => (
            <Card key={d._id} className="flex flex-col p-6">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold text-ink">{d.company}</p>
                  <p className="font-body text-sm text-slate">{d.jobRole}</p>
                </div>
                <Badge tone={DRIVE_STATUS_TONE[d.status]}>{d.status}</Badge>
              </div>
              <div className="mt-auto flex items-center justify-between pt-4">
                <div>
                  <p className="font-mono text-sm text-ink">{d.ctc?.display}</p>
                  <p className="font-mono text-xs text-slate">Deadline {formatDate(d.applicationDeadline)}</p>
                </div>
                <Button as={Link} to={`/student/drives/${d._id}`} variant="outline" className="px-4 py-2 text-xs">
                  View & apply
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
