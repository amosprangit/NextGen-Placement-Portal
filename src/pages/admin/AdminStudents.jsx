import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { studentsApi } from '../../lib/resourceApi'
import { Card, Badge, Button, Input, Select, PageLoader, EmptyState, ErrorBanner } from '../../components/ui/primitives'
import { COURSE_OPTIONS } from '../../lib/courseOptions'

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [filters, setFilters] = useState({ search: '', course: '', placementStatus: '', nocStatus: '' })
  const [busyId, setBusyId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = { limit: 100 }
      if (filters.search) params.search = filters.search
      if (filters.course) params.course = filters.course
      if (filters.placementStatus) params.placementStatus = filters.placementStatus
      if (filters.nocStatus) params.nocStatus = filters.nocStatus
      const res = await studentsApi.list(params)
      setStudents(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 300) // debounce search typing
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this student account? This cannot be undone.')) return
    setBusyId(id)
    try {
      await studentsApi.remove(id)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleNocReminder = async (id) => {
    setBusyId(id)
    setNotice('')
    setError('')
    try {
      const res = await studentsApi.sendNocReminder(id)
      setNotice(res.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-magenta">Roster</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Students</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Search roll number…"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="!py-2 text-xs"
          />
          <Select
            value={filters.course}
            onChange={(e) => setFilters((f) => ({ ...f, course: e.target.value }))}
            className="!py-2 text-xs"
          >
            <option value="">All courses</option>
            {COURSE_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            value={filters.placementStatus}
            onChange={(e) => setFilters((f) => ({ ...f, placementStatus: e.target.value }))}
            className="!py-2 text-xs"
          >
            <option value="">All statuses</option>
            <option value="unplaced">Unplaced</option>
            <option value="placed">Placed</option>
            <option value="opted_out">Opted out</option>
          </Select>
          <Select
            value={filters.nocStatus}
            onChange={(e) => setFilters((f) => ({ ...f, nocStatus: e.target.value }))}
            className="!py-2 text-xs"
          >
            <option value="">NOC: any</option>
            <option value="uploaded">NOC uploaded</option>
            <option value="missing">NOC missing</option>
          </Select>
        </div>
      </div>

      <ErrorBanner message={error} />
      {notice && (
        <p className="rounded-lg border border-forest/30 bg-forest/5 px-4 py-3 font-body text-sm text-forest">
          {notice}
        </p>
      )}

      {loading ? (
        <PageLoader />
      ) : students.length === 0 ? (
        <EmptyState title="No students found" body="Try clearing your filters." />
      ) : (
        <Card className="divide-y divide-border">
          {students.map((s) => (
            <div key={s._id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
              <Link to={`/admin/students/${s._id}`} className="min-w-0 flex-1">
                <p className="font-body text-sm font-semibold text-ink hover:text-violet">{s.user?.name}</p>
                <p className="font-body text-xs text-slate">
                  {s.rollNumber} · {s.course || 'No course'} · {s.branch} · Batch {s.batch} · CGPA {s.cgpa}
                </p>
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={s.placementStatus === 'placed' ? 'success' : 'neutral'}>
                  {s.placementStatus.replace('_', ' ')}
                </Badge>
                <Badge tone={s.nocUrl ? 'success' : 'pending'}>{s.nocUrl ? 'NOC ✓' : 'NOC missing'}</Badge>
                {!s.nocUrl && (
                  <Button
                    variant="outline"
                    className="px-3 py-1.5 text-xs"
                    disabled={busyId === s._id}
                    onClick={() => handleNocReminder(s._id)}
                  >
                    {busyId === s._id ? 'Sending…' : 'Send reminder'}
                  </Button>
                )}
                <Button as={Link} to={`/admin/students/${s._id}`} variant="outline" className="px-3 py-1.5 text-xs">
                  View profile
                </Button>
                <Button
                  variant="danger"
                  className="px-3 py-1.5 text-xs"
                  disabled={busyId === s._id}
                  onClick={() => handleRemove(s._id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
