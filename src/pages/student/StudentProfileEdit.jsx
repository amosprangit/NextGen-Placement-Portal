import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { studentsApi } from '../../lib/resourceApi'
import { Card, Button, Input, Select, PageLoader, ErrorBanner } from '../../components/ui/primitives'
import { useAuth } from '../../context/AuthContext'
import { COURSE_OPTIONS } from '../../lib/courseOptions'

const emptyForm = {
  course: '',
  branch: '',
  className: '',
  section: '',
  semester: '',
  batch: '',
  cgpa: '',
  backlogs: '0',
  phone: '',
  gender: '',
  address: '',
  skills: '',
  linkedin: '',
  github: '',
  portfolio: '',
}

export default function StudentProfile() {
  const { refreshProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [resumeFile, setResumeFile] = useState(null)
  const [nocFile, setNocFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const p = await studentsApi.me()
        setProfile(p)
        setForm({
          course: p.course || '',
          branch: p.branch || '',
          className: p.className || '',
          section: p.section || '',
          semester: p.semester ?? '',
          batch: p.batch || '',
          cgpa: p.cgpa ?? '',
          backlogs: p.backlogs ?? '0',
          phone: p.phone || '',
          gender: p.gender || '',
          address: p.address || '',
          skills: (p.skills || []).join(', '),
          linkedin: p.links?.linkedin || '',
          github: p.links?.github || '',
          portfolio: p.links?.portfolio || '',
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const fd = new FormData()
      fd.append('course', form.course)
      fd.append('branch', form.branch)
      fd.append('className', form.className)
      fd.append('section', form.section)
      if (form.semester) fd.append('semester', form.semester)
      fd.append('batch', form.batch)
      fd.append('cgpa', form.cgpa)
      fd.append('backlogs', form.backlogs)
      fd.append('phone', form.phone)
      fd.append('gender', form.gender)
      fd.append('address', form.address)
      fd.append(
        'skills',
        JSON.stringify(form.skills.split(',').map((s) => s.trim()).filter(Boolean))
      )
      fd.append(
        'links',
        JSON.stringify({ linkedin: form.linkedin, github: form.github, portfolio: form.portfolio })
      )
      if (resumeFile) fd.append('resume', resumeFile)
      if (nocFile) fd.append('noc', nocFile)

      const updated = await studentsApi.updateMe(fd)
      setProfile(updated)
      setSuccess('Profile saved.')
      setResumeFile(null)
      setNocFile(null)
      await refreshProfile()
    } catch (err) {
      setError(err.errors?.map((x) => x.message).join(' · ') || err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link to="/student/profile" className="font-body text-sm text-slate hover:text-ink">
          ← Back to profile
        </Link>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-magenta">Edit profile</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Your profile</h1>
        <p className="mt-1 font-body text-sm text-slate">
          Roll number: <span className="font-mono text-ink">{profile?.rollNumber}</span> (contact the
          placement cell to change this)
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <Card className="space-y-5 p-6">
          <ErrorBanner message={error} />
          {success && (
            <p className="rounded-lg border border-forest/30 bg-forest/5 px-4 py-3 font-body text-sm text-forest">
              {success}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select id="course" name="course" label="Course" required value={form.course} onChange={onChange}>
              <option value="">Select course</option>
              {COURSE_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Input id="branch" name="branch" label="Branch" required value={form.branch} onChange={onChange} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input id="className" name="className" label="Class" placeholder="TY-A" value={form.className} onChange={onChange} />
            <Input id="section" name="section" label="Section" placeholder="A" value={form.section} onChange={onChange} />
            <Input
              id="semester"
              name="semester"
              type="number"
              min="1"
              max="12"
              label="Semester"
              value={form.semester}
              onChange={onChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input id="batch" name="batch" type="number" label="Batch year" required value={form.batch} onChange={onChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="cgpa"
              name="cgpa"
              type="number"
              step="0.01"
              min="0"
              max="10"
              label="CGPA"
              required
              value={form.cgpa}
              onChange={onChange}
            />
            <Input
              id="backlogs"
              name="backlogs"
              type="number"
              min="0"
              label="Active backlogs"
              value={form.backlogs}
              onChange={onChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input id="phone" name="phone" label="Phone" value={form.phone} onChange={onChange} />
            <Select id="gender" name="gender" label="Gender" value={form.gender} onChange={onChange}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
          </div>

          <Input id="address" name="address" label="Address" value={form.address} onChange={onChange} />
          <Input
            id="skills"
            name="skills"
            label="Skills"
            placeholder="React, Node.js, SQL"
            hint="Comma-separated"
            value={form.skills}
            onChange={onChange}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input id="linkedin" name="linkedin" label="LinkedIn" value={form.linkedin} onChange={onChange} />
            <Input id="github" name="github" label="GitHub" value={form.github} onChange={onChange} />
            <Input id="portfolio" name="portfolio" label="Portfolio" value={form.portfolio} onChange={onChange} />
          </div>

          <div>
            <span className="mb-1.5 block font-body text-sm font-medium text-ink">Resume (PDF/DOC)</span>
            {profile?.resumeUrl && !resumeFile && (
              <p className="mb-2 font-body text-xs text-slate">
                Current file:{' '}
                <a
                  href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${profile.resumeUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet underline"
                >
                  view uploaded resume
                </a>
              </p>
            )}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-body text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            />
          </div>

          <div className="border-t border-border pt-5">
            <span className="mb-1.5 block font-body text-sm font-medium text-ink">
              No-Objection Certificate (NOC)
            </span>
            <p className="mb-2 font-body text-xs text-slate">
              Required before accepting an offer through certain drives. PDF, JPEG or PNG.
            </p>
            {profile?.nocUrl && !nocFile && (
              <p className="mb-2 font-body text-xs text-forest">
                ✓ Uploaded{profile.nocUploadedAt ? ` on ${new Date(profile.nocUploadedAt).toLocaleDateString('en-IN')}` : ''} —{' '}
                <a
                  href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${profile.nocUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet underline"
                >
                  view file
                </a>
              </p>
            )}
            {!profile?.nocUrl && !nocFile && (
              <p className="mb-2 font-body text-xs text-amber">Not uploaded yet</p>
            )}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setNocFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-body text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? 'Saving…' : 'Save profile'}
          </Button>
        </Card>
      </form>
    </div>
  )
}
