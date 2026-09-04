import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input, ErrorBanner } from '../components/ui/primitives'

const homeForRole = { student: '/student', recruiter: '/recruiter', admin: '/admin' }

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await login(form.email, form.password)
      const redirectTo = location.state?.from || homeForRole[user.role] || '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-soft px-6 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-baseline justify-center gap-1.5 font-display text-lg tracking-tight">
          <span className="text-blue">NextGen</span>
          <span className="text-magenta">·</span>
          <span className="text-magenta">CareerConnect</span>
        </Link>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-1 font-body text-sm text-slate">
            Log in as a student, recruiter, or placement cell admin.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <ErrorBanner message={error} />
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              autoComplete="email"
              required
              value={form.email}
              onChange={onChange}
            />
            <div>
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={onChange}
              />
              <Link
                to="/forgot-password"
                className="mt-1.5 inline-block font-body text-xs font-medium text-violet hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Logging in…' : 'Log in'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center font-body text-sm text-slate">
          New here?{' '}
          <Link to="/register/student" className="font-medium text-violet hover:underline">
            Register as student
          </Link>{' '}
          ·{' '}
          <Link to="/register/recruiter" className="font-medium text-violet hover:underline">
            Register as recruiter
          </Link>
        </p>
      </div>
    </div>
  )
}
