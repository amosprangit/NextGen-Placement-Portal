import { useEffect, useState } from 'react'
import { applicationsApi } from '../../lib/resourceApi'
import { Card, Badge, Button, PageLoader, EmptyState, ErrorBanner } from '../../components/ui/primitives'
import { formatDate, APPLICATION_STATUS_TONE, humanizeStatus } from '../../lib/format'

export default function StudentApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [withdrawingId, setWithdrawingId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await applicationsApi.mine({ limit: 100 })
      setApplications(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this application? This cannot be undone.')) return
    setWithdrawingId(id)
    try {
      await applicationsApi.withdraw(id)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setWithdrawingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-magenta">Tracker</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">My applications</h1>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <PageLoader />
      ) : applications.length === 0 ? (
        <EmptyState title="No applications yet" body="Browse open drives and apply to the ones you're eligible for." />
      ) : (
        <Card className="divide-y divide-border">
          {applications.map((a) => (
            <div key={a._id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
              <div>
                <p className="font-body text-sm font-semibold text-ink">{a.drive?.company}</p>
                <p className="font-body text-xs text-slate">
                  {a.drive?.jobRole} · Applied {formatDate(a.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={APPLICATION_STATUS_TONE[a.status]}>{humanizeStatus(a.status)}</Badge>
                {a.status === 'applied' && (
                  <Button
                    variant="danger"
                    className="px-3 py-1.5 text-xs"
                    disabled={withdrawingId === a._id}
                    onClick={() => handleWithdraw(a._id)}
                  >
                    {withdrawingId === a._id ? 'Withdrawing…' : 'Withdraw'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
