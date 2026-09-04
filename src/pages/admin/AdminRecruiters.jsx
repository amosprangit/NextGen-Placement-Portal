import { useEffect, useState } from 'react'
import { recruitersApi } from '../../lib/resourceApi'
import { Card, Badge, Button, Select, PageLoader, EmptyState, ErrorBanner } from '../../components/ui/primitives'

export default function AdminRecruiters() {
  const [recruiters, setRecruiters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('pending')
  const [busyId, setBusyId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = { limit: 100 }
      if (filter === 'pending') params.isApproved = 'false'
      if (filter === 'approved') params.isApproved = 'true'
      const res = await recruitersApi.list(params)
      setRecruiters(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const handleApprove = async (id) => {
    setBusyId(id)
    try {
      await recruitersApi.approve(id)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejecting this recruiter (optional):') || undefined
    setBusyId(id)
    try {
      await recruitersApi.reject(id, reason)
      await load()
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
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-magenta">Partners</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Recruiters</h1>
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="!py-2 text-xs">
          <option value="pending">Pending approval</option>
          <option value="approved">Approved</option>
          <option value="all">All</option>
        </Select>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <PageLoader />
      ) : recruiters.length === 0 ? (
        <EmptyState title="Nothing here" body="No recruiters match this filter." />
      ) : (
        <Card className="divide-y divide-border">
          {recruiters.map((r) => (
            <div key={r._id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
              <div>
                <p className="font-body text-sm font-semibold text-ink">{r.companyName}</p>
                <p className="font-body text-xs text-slate">
                  {r.user?.name} · {r.user?.email} {r.industry ? `· ${r.industry}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={r.isApproved ? 'success' : 'pending'}>
                  {r.isApproved ? 'Approved' : 'Pending'}
                </Badge>
                {!r.isApproved && (
                  <>
                    <Button
                      className="px-3 py-1.5 text-xs"
                      disabled={busyId === r._id}
                      onClick={() => handleApprove(r._id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      className="px-3 py-1.5 text-xs"
                      disabled={busyId === r._id}
                      onClick={() => handleReject(r._id)}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
