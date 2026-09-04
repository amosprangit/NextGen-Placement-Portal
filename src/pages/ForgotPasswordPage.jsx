import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../lib/authApi'
import { Button, Input, ErrorBanner } from '../components/ui/primitives'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
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
          {sent ? (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white">
                ✓
              </div>
              <h1 className="text-center font-display text-xl font-semibold text-ink">Check your email</h1>
              <p className="mt-2 text-center font-body text-sm leading-relaxed text-slate">
                If an account exists for <span className="font-medium text-ink">{email}</span>, we've sent a
                link to reset your password. It expires in 30 minutes.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold text-ink">Forgot your password?</h1>
              <p className="mt-1 font-body text-sm text-slate">
                Enter your account email and we'll send you a reset link.
              </p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <ErrorBanner message={error} />
                <Input
                  id="email"
                  type="email"
                  label="Email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center font-body text-sm text-slate">
          <Link to="/login" className="font-medium text-violet hover:underline">
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
