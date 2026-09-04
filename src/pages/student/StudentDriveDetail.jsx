import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { drivesApi, applicationsApi } from '../../lib/resourceApi'
import { Card, Badge, Button, Textarea, PageLoader, ErrorBanner } from '../../components/ui/primitives'
import { formatDate, DRIVE_STATUS_TONE } from '../../lib/format'

export default function StudentDriveDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [drive, setDrive] = useState(null)
  const [eligible, setEligible] = useState(null)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [coverNote, setCoverNote] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await drivesApi.get(id)
      setDrive(res.drive)
      setEligible(res.eligible)
      setAlreadyApplied(res.alreadyApplied)
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

  const handleApply = async () => {
    setApplying(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('coverNote', coverNote)
      if (resumeFile) fd.append('resume', resumeFile)
      await applicationsApi.apply(id, fd)
      setSuccess('Application submitted!')
      setAlreadyApplied(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setApplying(false)
    }
  }

  if (loading) return <PageLoader />
  if (!drive) return <ErrorBanner message={error || 'Drive not found'} />

  const canApply = drive.status === 'open' && eligible && !alreadyApplied

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => navigate(-1)} className="font-body text-sm text-slate hover:text-ink">
        ← Back
      </button>

      <Card className="p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-display text-2xl font-semibold text-ink">{drive.company}</p>
            <p className="mt-1 font-body text-slate">{drive.jobRole} · {drive.jobType}</p>
          </div>
          <Badge tone={DRIVE_STATUS_TONE[drive.status]}>{drive.status}</Badge>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-y border-border py-5 sm:grid-cols-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate">CTC</p>
            <p className="mt-1 font-mono text-sm text-ink">{drive.ctc?.display}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate">Location</p>
            <p className="mt-1 font-mono text-sm text-ink">{drive.location || '—'}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate">Deadline</p>
            <p className="mt-1 font-mono text-sm text-ink">{formatDate(drive.applicationDeadline)}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate">Min CGPA</p>
            <p className="mt-1 font-mono text-sm text-ink">{drive.eligibility?.minCgpa ?? 0}</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-display text-base font-semibold text-ink">About this role</h2>
          <p className="mt-2 whitespace-pre-line font-body text-sm leading-relaxed text-slate">{drive.description}</p>
        </div>

        {drive.rounds?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-display text-base font-semibold text-ink">Selection process</h2>
            <ol className="mt-3 space-y-2">
              {drive.rounds
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((r) => (
                  <li key={r._id} className="flex gap-3 font-body text-sm text-slate">
                    <span className="font-mono text-violet">{String(r.order).padStart(2, '0')}</span>
                    {r.name}
                  </li>
                ))}
            </ol>
          </div>
        )}

        <div className="mt-8 border-t border-border pt-6">
          <ErrorBanner message={error} />
          {success && (
            <p className="mb-4 rounded-lg border border-forest/30 bg-forest/5 px-4 py-3 font-body text-sm text-forest">
              {success}
            </p>
          )}

          {alreadyApplied ? (
            <Badge tone="brand">You've already applied to this drive</Badge>
          ) : drive.status !== 'open' ? (
            <p className="font-body text-sm text-slate">This drive is not currently accepting applications.</p>
          ) : eligible === false ? (
            <p className="font-body text-sm text-slate">
              You don't currently meet the eligibility criteria for this drive.
            </p>
          ) : (
            <div className="space-y-3">
              <Textarea
                label="Cover note (optional)"
                rows={3}
                placeholder="A short note to the recruiter…"
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
              />
              <div>
                <span className="mb-1.5 block font-body text-sm font-medium text-ink">
                  Resume for this drive (optional)
                </span>
                <p className="mb-2 font-body text-xs text-slate">
                  Leave blank to use the resume already on your profile.
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-body text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                />
              </div>
              <Button onClick={handleApply} disabled={!canApply || applying}>
                {applying ? 'Submitting…' : 'Apply to this drive'}
              </Button>
            </div>
          )}
        </div>
      </Card>

      <p className="font-body text-sm text-slate">
        Need to update your resume first?{' '}
        <Link to="/student/profile/edit" className="font-medium text-violet hover:underline">
          Go to profile
        </Link>
      </p>
    </div>
  )
}
