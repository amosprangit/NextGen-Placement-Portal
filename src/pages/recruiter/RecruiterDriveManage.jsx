import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { drivesApi, applicationsApi } from '../../lib/resourceApi'
import { Card, Badge, Button, Select, PageLoader, ErrorBanner } from '../../components/ui/primitives'
import ApplicantsTable from '../../components/ApplicantsTable'
import DriveAnalyticsChart from '../../components/DriveAnalyticsChart'
import ExportPanel from '../../components/ExportPanel'
import { formatDate, DRIVE_STATUS_TONE } from '../../lib/format'

const STATUS_OPTIONS = ['draft', 'upcoming', 'open', 'closed', 'completed', 'cancelled']

export default function RecruiterDriveManage() {
  const { id } = useParams()
  const [drive, setDrive] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusSaving, setStatusSaving] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [driveRes, analyticsRes, appsRes] = await Promise.all([
        drivesApi.get(id),
        drivesApi.analytics(id),
        applicationsApi.forDrive(id, { limit: 200 }),
      ])
      setDrive(driveRes.drive)
      setAnalytics(analyticsRes)
      setApplications(appsRes.data)
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

  const handleStatusChange = async (status) => {
    setStatusSaving(true)
    setError('')
    try {
      const updated = await drivesApi.updateStatus(id, status)
      setDrive(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setStatusSaving(false)
    }
  }

  const handleStatusUpdate = async (appId, status) => {
    setBusyId(appId)
    try {
      await applicationsApi.updateStatus(appId, { status })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleAttendance = async (appId, attendance) => {
    setBusyId(appId)
    try {
      await applicationsApi.updateMeta(appId, { attendance })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleInterview = async (appId, interviewGiven) => {
    setBusyId(appId)
    try {
      await applicationsApi.updateMeta(appId, { interviewGiven })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <PageLoader />
  if (!drive) return <ErrorBanner message={error || 'Drive not found'} />

  return (
    <div className="space-y-6">
      <Link to="/recruiter/drives" className="font-body text-sm text-slate hover:text-ink">
        ← Back to drives
      </Link>

      <ErrorBanner message={error} />

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-display text-2xl font-semibold text-ink">{drive.title}</p>
            <p className="mt-1 font-body text-sm text-slate">
              {drive.company} · {drive.jobRole} · CTC {drive.ctc?.display}
            </p>
            <p className="mt-1 font-mono text-xs text-slate">Deadline {formatDate(drive.applicationDeadline)}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone={DRIVE_STATUS_TONE[drive.status]}>{drive.status}</Badge>
            {drive.status === 'draft' ? (
              <span className="font-body text-xs text-slate">Awaiting placement cell approval</span>
            ) : (
              <Select
                value={drive.status}
                disabled={statusSaving}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="!py-2 text-xs"
              >
                {STATUS_OPTIONS.filter((s) => s !== 'draft').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            )}
          </div>
        </div>
      </Card>

      <DriveAnalyticsChart analytics={analytics} />

      <div>
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">
          Applicants <span className="font-body text-sm font-normal text-slate">({applications.length})</span>
        </h2>
        <ApplicantsTable
          applications={applications}
          busyId={busyId}
          onStatusChange={handleStatusUpdate}
          onAttendanceChange={handleAttendance}
          onInterviewToggle={handleInterview}
        />
      </div>

      <ExportPanel driveId={id} filename={`${drive.company}-applicants.xlsx`} canEmail={false} />
    </div>
  )
}
