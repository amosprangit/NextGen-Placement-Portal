import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { studentsApi } from '../../lib/resourceApi'
import { Card, Badge, Button, PageLoader, ErrorBanner } from '../../components/ui/primitives'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../lib/format'

const fileBase = () => import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('')

export default function StudentProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setProfile(await studentsApi.me())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <PageLoader />
  if (!profile) return <ErrorBanner message={error || 'Profile not found'} />

  const completeness = profile.isProfileComplete

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Cover + avatar, social-profile style but kept professional */}
      <Card className="overflow-hidden">
        <div className="h-28 bg-brand" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end justify-between">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-ink font-display text-3xl font-semibold text-white shadow-md">
              {initials(user?.name)}
            </div>
            <Button as={Link} to="/student/profile/edit" variant="outline" className="mb-1">
              Edit profile
            </Button>
          </div>

          <h1 className="mt-4 font-display text-2xl font-semibold text-ink">{user?.name}</h1>
          <p className="font-body text-sm text-slate">{user?.email}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="brand">{profile.course || 'Course not set'}</Badge>
            <Badge tone="neutral">{profile.branch}</Badge>
            {profile.className && <Badge tone="neutral">Class {profile.className}</Badge>}
            {profile.section && <Badge tone="neutral">Section {profile.section}</Badge>}
            {profile.semester && <Badge tone="neutral">Semester {profile.semester}</Badge>}
            <Badge tone="neutral">Batch {profile.batch}</Badge>
            <Badge tone={profile.placementStatus === 'placed' ? 'success' : 'neutral'}>
              {profile.placementStatus?.replace('_', ' ')}
            </Badge>
          </div>

          {!completeness && (
            <p className="mt-4 rounded-lg border border-amber/30 bg-amber/5 px-4 py-2.5 font-body text-xs text-ink">
              Your profile isn't complete yet — add your resume and academic details so recruiters and the
              placement cell see the full picture.{' '}
              <Link to="/student/profile/edit" className="font-semibold text-violet hover:underline">
                Finish it now →
              </Link>
            </p>
          )}
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="px-5 py-4 text-center">
          <p className="font-display text-2xl font-semibold text-ink">{profile.cgpa ?? '—'}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate">CGPA</p>
        </Card>
        <Card className="px-5 py-4 text-center">
          <p className="font-display text-2xl font-semibold text-ink">{profile.backlogs ?? 0}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate">Backlogs</p>
        </Card>
        <Card className="px-5 py-4 text-center">
          <p className="font-display text-2xl font-semibold text-ink">{profile.skills?.length || 0}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate">Skills listed</p>
        </Card>
      </div>

      {/* About / contact */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-ink">About</h2>
        <dl className="mt-4 grid grid-cols-2 gap-y-4 sm:grid-cols-3">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate">Roll number</dt>
            <dd className="mt-1 font-body text-sm text-ink">{profile.rollNumber}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate">Phone</dt>
            <dd className="mt-1 font-body text-sm text-ink">{profile.phone || '—'}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate">Address</dt>
            <dd className="mt-1 font-body text-sm text-ink">{profile.address || '—'}</dd>
          </div>
        </dl>

        {profile.skills?.length > 0 && (
          <div className="mt-6 border-t border-border pt-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate">Skills</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border bg-bg px-3 py-1 font-body text-xs text-ink"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {(profile.links?.linkedin || profile.links?.github || profile.links?.portfolio) && (
          <div className="mt-6 border-t border-border pt-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate">Links</p>
            <div className="mt-2 flex flex-wrap gap-4">
              {profile.links?.linkedin && (
                <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="font-body text-sm text-violet hover:underline">
                  LinkedIn
                </a>
              )}
              {profile.links?.github && (
                <a href={profile.links.github} target="_blank" rel="noreferrer" className="font-body text-sm text-violet hover:underline">
                  GitHub
                </a>
              )}
              {profile.links?.portfolio && (
                <a href={profile.links.portfolio} target="_blank" rel="noreferrer" className="font-body text-sm text-violet hover:underline">
                  Portfolio
                </a>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Documents */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Documents</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-4">
            <p className="font-body text-sm font-semibold text-ink">Resume</p>
            {profile.resumeUrl ? (
              <a
                href={`${fileBase()}${profile.resumeUrl}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block font-body text-sm text-violet hover:underline"
              >
                View uploaded resume
              </a>
            ) : (
              <p className="mt-1 font-body text-sm text-amber">Not uploaded yet</p>
            )}
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="font-body text-sm font-semibold text-ink">No-Objection Certificate</p>
            {profile.nocUrl ? (
              <>
                <a
                  href={`${fileBase()}${profile.nocUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block font-body text-sm text-violet hover:underline"
                >
                  View NOC
                </a>
                {profile.nocUploadedAt && (
                  <p className="mt-1 font-body text-xs text-slate">Uploaded {formatDate(profile.nocUploadedAt)}</p>
                )}
              </>
            ) : (
              <p className="mt-1 font-body text-sm text-amber">Not uploaded yet</p>
            )}
          </div>
        </div>
      </Card>

      {profile.placementStatus === 'placed' && profile.placedIn && (
        <Card className="border-forest/30 bg-forest/5 p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Placement</h2>
          <p className="mt-2 font-body text-sm text-ink">
            Placed at <span className="font-semibold">{profile.placedIn.company}</span>
            {profile.placedIn.ctc && ` · ${profile.placedIn.ctc}`}
          </p>
          {profile.placedIn.placedAt && (
            <p className="mt-1 font-body text-xs text-slate">on {formatDate(profile.placedIn.placedAt)}</p>
          )}
        </Card>
      )}
    </div>
  )
}
