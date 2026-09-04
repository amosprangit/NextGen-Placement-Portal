import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { drivesApi } from '../../lib/resourceApi'
import { Card, Button, Input, Select, Textarea, ErrorBanner } from '../../components/ui/primitives'

const emptyForm = {
  title: '',
  company: '',
  jobRole: '',
  jobType: 'full-time',
  description: '',
  location: '',
  ctcDisplay: '',
  ctcAnnual: '',
  applicationDeadline: '',
  driveDate: '',
  minCgpa: '0',
  maxBacklogs: '0',
  branches: '',
  batches: '',
}

export default function RecruiterDriveForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [rounds, setRounds] = useState([{ name: 'Online Aptitude', order: 1 }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const addRound = () => setRounds((r) => [...r, { name: '', order: r.length + 1 }])
  const updateRound = (i, name) =>
    setRounds((r) => r.map((round, idx) => (idx === i ? { ...round, name } : round)))
  const removeRound = (i) =>
    setRounds((r) => r.filter((_, idx) => idx !== i).map((round, idx) => ({ ...round, order: idx + 1 })))

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        title: form.title,
        company: form.company,
        jobRole: form.jobRole,
        jobType: form.jobType,
        description: form.description,
        location: form.location,
        ctc: {
          display: form.ctcDisplay,
          ...(form.ctcAnnual ? { annualValueINR: Number(form.ctcAnnual) } : {}),
        },
        applicationDeadline: form.applicationDeadline,
        ...(form.driveDate ? { driveDate: form.driveDate } : {}),
        eligibility: {
          minCgpa: Number(form.minCgpa) || 0,
          maxBacklogs: Number(form.maxBacklogs) || 0,
          branches: form.branches.split(',').map((b) => b.trim()).filter(Boolean),
          batches: form.batches
            .split(',')
            .map((b) => Number(b.trim()))
            .filter((b) => !Number.isNaN(b)),
        },
        rounds: rounds.filter((r) => r.name.trim()),
      }
      const drive = await drivesApi.create(payload)
      navigate(`/recruiter/drives/${drive._id}`)
    } catch (err) {
      setError(err.errors?.map((x) => x.message).join(' · ') || err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/recruiter/drives" className="font-body text-sm text-slate hover:text-ink">
        ← Back to drives
      </Link>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-magenta">New posting</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Post a drive</h1>
        <p className="mt-1 font-body text-sm text-slate">
          Your drive is saved as a draft and reviewed by the placement cell before it goes live.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <Card className="space-y-5 p-6">
          <ErrorBanner message={error} />

          <div className="grid grid-cols-2 gap-4">
            <Input id="title" name="title" label="Drive title" placeholder="Campus Hiring 2027" required value={form.title} onChange={onChange} />
            <Input id="company" name="company" label="Company" required value={form.company} onChange={onChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input id="jobRole" name="jobRole" label="Job role" required value={form.jobRole} onChange={onChange} />
            <Select id="jobType" name="jobType" label="Job type" value={form.jobType} onChange={onChange}>
              <option value="full-time">Full-time</option>
              <option value="internship">Internship</option>
              <option value="ppo">PPO</option>
            </Select>
          </div>

          <Textarea id="description" name="description" label="Description" rows={4} required value={form.description} onChange={onChange} />

          <div className="grid grid-cols-2 gap-4">
            <Input id="location" name="location" label="Location" value={form.location} onChange={onChange} />
            <Input id="ctcDisplay" name="ctcDisplay" label="CTC (display)" placeholder="₹18 LPA" required value={form.ctcDisplay} onChange={onChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="applicationDeadline"
              name="applicationDeadline"
              type="datetime-local"
              label="Application deadline"
              required
              value={form.applicationDeadline}
              onChange={onChange}
            />
            <Input id="driveDate" name="driveDate" type="date" label="Drive date (optional)" value={form.driveDate} onChange={onChange} />
          </div>

          <div className="border-t border-border pt-5">
            <p className="mb-3 font-body text-sm font-semibold text-ink">Eligibility criteria</p>
            <div className="grid grid-cols-2 gap-4">
              <Input id="minCgpa" name="minCgpa" type="number" step="0.1" min="0" max="10" label="Minimum CGPA" value={form.minCgpa} onChange={onChange} />
              <Input id="maxBacklogs" name="maxBacklogs" type="number" min="0" label="Max active backlogs" value={form.maxBacklogs} onChange={onChange} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Input id="branches" name="branches" label="Eligible branches" placeholder="Computer Science, IT (blank = all)" value={form.branches} onChange={onChange} />
              <Input id="batches" name="batches" label="Eligible batches" placeholder="2027, 2028 (blank = all)" value={form.batches} onChange={onChange} />
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <p className="mb-3 font-body text-sm font-semibold text-ink">Selection rounds</p>
            <div className="space-y-2">
              {rounds.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 shrink-0 font-mono text-xs text-slate">{r.order}.</span>
                  <Input
                    className="flex-1"
                    value={r.name}
                    onChange={(e) => updateRound(i, e.target.value)}
                    placeholder="Round name"
                  />
                  {rounds.length > 1 && (
                    <button type="button" onClick={() => removeRound(i)} className="font-body text-xs text-slate hover:text-rose-600">
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addRound} className="mt-3 font-body text-sm font-medium text-violet hover:underline">
              + Add round
            </button>
          </div>

          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? 'Posting…' : 'Post drive'}
          </Button>
        </Card>
      </form>
    </div>
  )
}
