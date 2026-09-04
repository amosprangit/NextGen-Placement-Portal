import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Select, ErrorBanner } from '../components/ui/primitives'
import { COURSE_OPTIONS } from '../lib/courseOptions'

const currentYear = new Date().getFullYear()
const batchOptions = Array.from({ length: 6 }, (_, i) => currentYear + i)

export default function RegisterStudentPage() {
  const { registerStudent } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    course: '',
    branch: '',
    className: '',
    section: '',
    semester: '',
    batch: String(currentYear + 1),
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await registerStudent({ ...form, batch: Number(form.batch) })
      navigate('/student', { replace: true })
    } catch (err) {
      setError(err.errors?.map((x) => x.message).join(' · ') || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-soft px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-baseline justify-center gap-1.5 font-display text-lg tracking-tight">
          <span className="text-blue">NextGen</span>
          <span className="text-magenta">·</span>
          <span className="text-magenta">CareerConnect</span>
        </Link>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h1 className="font-display text-2xl font-semibold text-ink">Create your student account</h1>
          <p className="mt-1 font-body text-sm text-slate">
            You'll be logged in immediately and can complete your profile after.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <ErrorBanner message={error} />
            <Input id="name" name="name" label="Full name" required value={form.name} onChange={onChange} />
            <Input
              id="email"
              name="email"
              type="email"
              label="University email"
              required
              value={form.email}
              onChange={onChange}
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              hint="At least 8 characters, one uppercase letter, one number"
              required
              value={form.password}
              onChange={onChange}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="rollNumber"
                name="rollNumber"
                label="Roll number"
                required
                value={form.rollNumber}
                onChange={onChange}
              />
              <Select id="course" name="course" label="Course" required value={form.course} onChange={onChange}>
                <option value="">Select course</option>
                {COURSE_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="branch"
                name="branch"
                label="Branch / specialization"
                placeholder="Computer Science"
                required
                value={form.branch}
                onChange={onChange}
              />
              <label className="block" htmlFor="batch">
                <span className="mb-1.5 block font-body text-sm font-medium text-ink">Batch</span>
                <select
                  id="batch"
                  name="batch"
                  value={form.batch}
                  onChange={onChange}
                  className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-violet/30"
                >
                  {batchOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
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
                placeholder="5"
                value={form.semester}
                onChange={onChange}
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center font-body text-sm text-slate">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-violet hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
