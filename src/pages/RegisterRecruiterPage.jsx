import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input, ErrorBanner } from '../components/ui/primitives'

export default function RegisterRecruiterPage() {
  const { registerRecruiter } = useAuth()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    designation: '',
    industry: '',
    website: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await registerRecruiter(form)
      setSubmitted(true)
    } catch (err) {
      setError(err.errors?.map((x) => x.message).join(' · ') || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-soft px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white">
            ✓
          </div>
          <h1 className="font-display text-xl font-semibold text-ink">Application submitted</h1>
          <p className="mt-2 font-body text-sm leading-relaxed text-slate">
            Thanks, {form.name.split(' ')[0]}. The placement cell will review {form.companyName}'s
            details and approve your account before you can log in — you'll be notified by email.
          </p>
          <Link to="/" className="mt-6 inline-block font-body text-sm font-semibold text-violet hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    )
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
          <h1 className="font-display text-2xl font-semibold text-ink">Register your company</h1>
          <p className="mt-1 font-body text-sm text-slate">
            Recruiter accounts are reviewed by the placement cell before you can log in.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <ErrorBanner message={error} />
            <Input id="name" name="name" label="Your name" required value={form.name} onChange={onChange} />
            <Input id="email" name="email" type="email" label="Work email" required value={form.email} onChange={onChange} />
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
            <Input id="companyName" name="companyName" label="Company name" required value={form.companyName} onChange={onChange} />
            <div className="grid grid-cols-2 gap-4">
              <Input id="designation" name="designation" label="Designation" value={form.designation} onChange={onChange} />
              <Input id="industry" name="industry" label="Industry" value={form.industry} onChange={onChange} />
            </div>
            <Input id="website" name="website" label="Company website" placeholder="https://" value={form.website} onChange={onChange} />
            <Input id="phone" name="phone" label="Phone" value={form.phone} onChange={onChange} />

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Submitting…' : 'Submit for approval'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center font-body text-sm text-slate">
          Already approved?{' '}
          <Link to="/login" className="font-medium text-violet hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
