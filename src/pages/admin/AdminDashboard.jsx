import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../lib/resourceApi'
import { Card, Button, PageLoader, ErrorBanner } from '../../components/ui/primitives'
import StatCard from '../../components/StatCard'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setStats(await adminApi.dashboard())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <PageLoader />
  if (!stats) return <ErrorBanner message={error} />

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-magenta">Placement cell</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Dashboard</h1>
      </div>

      <ErrorBanner message={error} />

      {stats.recruiters.pending > 0 && (
        <Card className="flex flex-wrap items-center justify-between gap-4 border-amber/30 bg-amber/5 px-6 py-4">
          <p className="font-body text-sm text-ink">
            {stats.recruiters.pending} recruiter{stats.recruiters.pending > 1 ? 's are' : ' is'} waiting on approval.
          </p>
          <Button as={Link} to="/admin/recruiters" className="px-4 py-2 text-xs">
            Review
          </Button>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={stats.students.total} sub={`${stats.students.placed} placed`} />
        <StatCard label="Placement rate" value={`${stats.students.placementRate}%`} />
        <StatCard label="Recruiters" value={stats.recruiters.approved} sub={`${stats.recruiters.pending} pending`} />
        <StatCard label="Open drives" value={stats.drives.open} sub={`${stats.drives.total} total`} />
      </div>

      <Card className="p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Branch-wise placement</h2>
        {stats.branchWiseBreakdown.length === 0 ? (
          <p className="font-body text-sm text-slate">No student records yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {stats.branchWiseBreakdown.map((b) => (
              <div key={b._id} className="flex items-center justify-between py-3">
                <p className="font-body text-sm text-ink">{b._id || 'Unspecified'}</p>
                <p className="font-mono text-sm text-slate">
                  {b.placed} / {b.total} placed
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
