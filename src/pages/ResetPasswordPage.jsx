import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { authApi } from '../lib/authApi'
import { Button, Input, ErrorBanner } from '../components/ui/primitives'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await authApi.resetPassword(token, newPassword)
      setDone(true)
    } catch (err) {
      setError(err.errors?.map((x) => x.message).join(' · ') || err.message)
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
          {done ? (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white">
                ✓
              </div>
              <h1 className="text-center font-display text-xl font-semibold text-ink">Password reset</h1>
              <p className="mt-2 text-center font-body text-sm leading-relaxed text-slate">
                Your password has been updated. You can now log in with it.
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="mt-6 w-full"
              >
                Go to login
              </Button>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold text-ink">Set a new password</h1>
              <p className="mt-1 font-body text-sm text-slate">
                This link works once and expires 30 minutes after it was requested.
              </p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <ErrorBanner message={error} />
                <Input
                  id="newPassword"
                  type="password"
                  label="New password"
                  hint="At least 8 characters, one uppercase letter, one number"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Resetting…' : 'Reset password'}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center font-body text-sm text-slate">
          <Link to="/forgot-password" className="font-medium text-violet hover:underline">
            Request a new link
          </Link>
        </p>
      </div>
    </div>
  )
}
