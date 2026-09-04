import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { studentsApi } from '../../lib/resourceApi'
import { Card, Badge, Button, Select, Input, PageLoader, ErrorBanner } from '../../components/ui/primitives'
import { formatDate, APPLICATION_STATUS_TONE, humanizeStatus } from '../../lib/format'

const fileBase = () => import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')

const PLACEMENT_OPTIONS = ['unplaced', 'placed', 'opted_out']

export default function AdminStudentDetail() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [statusForm, setStatusForm] = useState({ placementStatus: 'unplaced', company: '', ctc: '' })
  const [savingStatus, setSavingStatus] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [p, apps] = await Promise.all([studentsApi.get(id), studentsApi.getApplications(id)])
      setProfile(p)
      setApplications(apps)
      setStatusForm({
        placementStatus: p.placementStatus,
        company: p.placedIn?.company || '',
        ctc: p.placedIn?.ctc || '',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleStatusSave = async (e) => {
    e.preventDefault()
    setSavingStatus(true)
    setError('')
    setNotice('')
    try {
      const payload = { placementStatus: statusForm.placementStatus }
      if (statusForm.placementStatus === 'placed') {
        payload.company = statusForm.company
        payload.ctc = statusForm.ctc
      }
      const updated = await studentsApi.updatePlacementStatus(id, payload)
      setProfile((p) => ({ ...p, ...updated }))
      setNotice('Placement status updated.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingStatus(false)
    }
  }

  const handleNocReminder = async () => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const res = await studentsApi.sendNocReminder(id)
      setNotice(res.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <PageLoader />
  if (!profile) return <ErrorBanner message={error || 'Student not found'} />

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/admin/students" className="font-body text-sm text-slate hover:text-ink">
        ← Back to students
      </Link>

      <Card className="overflow-hidden">
        <div className="h-24 bg-brand" />
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-9 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="flex h-[72px] w-[72px] flex-none items-center justify-center rounded-full border-4 border-white bg-ink font-display text-xl font-semibold text-white shadow-sm">
                {initials(profile.user?.name)}
              </div>
              <div className="pb-1">
                <h1 className="font-display text-xl font-semibold text-ink">{profile.user?.name}</h1>
                <p className="font-body text-sm text-slate">
                  {profile.rollNumber} · {profile.course} · {profile.branch} · Batch {profile.batch}
                </p>
              </div>
            </div>
            <Badge tone={profile.user?.isActive ? 'success' : 'danger'}>
              {profile.user?.isActive ? 'Active account' : 'Deactivated'}
            </Badge>
          </div>
        </div>
      </Card>

      <ErrorBanner message={error} />
      {notice && (
        <p className="rounded-lg border border-forest/30 bg-forest/5 px-4 py-3 font-body text-sm text-forest">
          {notice}
        </p>
      )}

      {/* Contact + files */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Contact & documents</h2>
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate">Email</dt>
            <dd className="mt-1 font-body text-sm text-ink">{profile.user?.email}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate">Phone</dt>
            <dd className="mt-1 font-body text-sm text-ink">{profile.phone || '—'}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate">Class / Section / Semester</dt>
            <dd className="mt-1 font-body text-sm text-ink">
              {profile.className || '—'} / {profile.section || '—'} / {profile.semester || '—'}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate">CGPA / Backlogs</dt>
            <dd className="mt-1 font-body text-sm text-ink">
              {profile.cgpa} / {profile.backlogs ?? 0}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-5">
          {profile.resumeUrl ? (
            <a
              href={`${fileBase()}${profile.resumeUrl}`}
              target="_blank"
              rel="noreferrer"
              className="font-body text-sm font-semibold text-violet hover:underline"
            >
              Download resume →
            </a>
          ) : (
            <span className="font-body text-sm text-slate">No resume uploaded</span>
          )}

          {profile.nocUrl ? (
            <a
              href={`${fileBase()}${profile.nocUrl}`}
              target="_blank"
              rel="noreferrer"
              className="font-body text-sm font-semibold text-violet hover:underline"
            >
              Download NOC →
            </a>
          ) : (
            <>
              <span className="font-body text-sm text-amber">NOC not uploaded</span>
              <Button variant="outline" className="px-3 py-1.5 text-xs" disabled={busy} onClick={handleNocReminder}>
                {busy ? 'Sending…' : 'Send NOC reminder'}
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Placement status editor */}
      <form onSubmit={handleStatusSave}>
        <Card className="space-y-4 p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Placement status</h2>
          <Select
            label="Status"
            value={statusForm.placementStatus}
            onChange={(e) => setStatusForm((f) => ({ ...f, placementStatus: e.target.value }))}
          >
            {PLACEMENT_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {humanizeStatus(s)}
              </option>
            ))}
          </Select>

          {statusForm.placementStatus === 'placed' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Company"
                value={statusForm.company}
                onChange={(e) => setStatusForm((f) => ({ ...f, company: e.target.value }))}
              />
              <Input
                label="CTC"
                placeholder="₹18 LPA"
                value={statusForm.ctc}
                onChange={(e) => setStatusForm((f) => ({ ...f, ctc: e.target.value }))}
              />
            </div>
          )}

          <Button type="submit" disabled={savingStatus} className="w-full sm:w-auto">
            {savingStatus ? 'Saving…' : 'Update status'}
          </Button>
        </Card>
      </form>

      {/* Application history */}
      <Card className="p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">
          Application history <span className="font-body text-sm font-normal text-slate">({applications.length})</span>
        </h2>
        {applications.length === 0 ? (
          <p className="font-body text-sm text-slate">This student hasn't applied to any drives yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {applications.map((a) => (
              <li key={a._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-body text-sm font-semibold text-ink">{a.drive?.company}</p>
                  <p className="font-body text-xs text-slate">
                    {a.drive?.jobRole} · Applied {formatDate(a.createdAt)}
                  </p>
                </div>
                <Badge tone={APPLICATION_STATUS_TONE[a.status]}>{humanizeStatus(a.status)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
