import { Card, Badge, Select, EmptyState } from './ui/primitives'
import { APPLICATION_STATUS_TONE, humanizeStatus } from '../lib/format'

const APP_STATUS_OPTIONS = ['applied', 'shortlisted', 'interview_scheduled', 'selected', 'rejected']
const ATTENDANCE_OPTIONS = ['not_marked', 'present', 'absent']

const fileUrl = (path) => {
  if (!path) return null
  const origin = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
  return `${origin}${path}`
}

export default function ApplicantsTable({ applications, busyId, onStatusChange, onAttendanceChange, onInterviewToggle }) {
  if (applications.length === 0) {
    return <EmptyState title="No applicants yet" body="Applications will show up here once students apply." />
  }

  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[880px] text-left">
        <thead>
          <tr className="border-b border-border font-mono text-[10px] uppercase tracking-wider text-slate">
            <th className="px-5 py-3 font-medium">Student</th>
            <th className="px-5 py-3 font-medium">Contact</th>
            <th className="px-5 py-3 font-medium">Academics</th>
            <th className="px-5 py-3 font-medium">Resume</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Attendance</th>
            <th className="px-5 py-3 font-medium">Interview</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {applications.map((a) => (
            <tr key={a._id}>
              <td className="px-5 py-4">
                <p className="font-body text-sm font-semibold text-ink">{a.student?.user?.name}</p>
                <p className="font-mono text-xs text-slate">{a.student?.rollNumber}</p>
              </td>
              <td className="px-5 py-4">
                <p className="font-body text-xs text-ink">{a.student?.user?.email}</p>
                <p className="font-body text-xs text-slate">{a.student?.phone || '—'}</p>
              </td>
              <td className="px-5 py-4 font-body text-xs text-slate">
                {a.student?.branch} · CGPA {a.student?.cgpa}
              </td>
              <td className="px-5 py-4">
                {a.resumeUrlSnapshot || a.student?.resumeUrl ? (
                  <a
                    href={fileUrl(a.resumeUrlSnapshot || a.student?.resumeUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-body text-xs font-medium text-violet hover:underline"
                  >
                    Download
                  </a>
                ) : (
                  <span className="font-body text-xs text-slate">—</span>
                )}
              </td>
              <td className="px-5 py-4">
                <div className="flex flex-col gap-1.5">
                  <Badge tone={APPLICATION_STATUS_TONE[a.status]}>{humanizeStatus(a.status)}</Badge>
                  {onStatusChange && (
                    <Select
                      value={a.status}
                      disabled={busyId === a._id}
                      onChange={(e) => onStatusChange(a._id, e.target.value)}
                      className="!py-1 text-[11px]"
                    >
                      {APP_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {humanizeStatus(s)}
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
              </td>
              <td className="px-5 py-4">
                {onAttendanceChange ? (
                  <Select
                    value={a.attendance}
                    disabled={busyId === a._id}
                    onChange={(e) => onAttendanceChange(a._id, e.target.value)}
                    className="!py-1.5 text-[11px]"
                  >
                    {ATTENDANCE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {humanizeStatus(s)}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <span className="font-body text-xs text-slate">{humanizeStatus(a.attendance)}</span>
                )}
              </td>
              <td className="px-5 py-4">
                {onInterviewToggle ? (
                  <label className="inline-flex items-center gap-2 font-body text-xs text-ink">
                    <input
                      type="checkbox"
                      checked={a.interviewGiven}
                      disabled={busyId === a._id}
                      onChange={(e) => onInterviewToggle(a._id, e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-border text-violet focus:ring-violet/30"
                    />
                    Given
                  </label>
                ) : (
                  <span className="font-body text-xs text-slate">{a.interviewGiven ? 'Yes' : 'No'}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
