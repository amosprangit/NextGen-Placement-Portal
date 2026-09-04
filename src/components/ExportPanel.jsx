import { useState } from 'react'
import { Card, Button, Input, ErrorBanner } from './ui/primitives'
import { applicationsApi } from '../lib/resourceApi'

export default function ExportPanel({ driveId, filename, canEmail }) {
  const [downloading, setDownloading] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleDownload = async () => {
    setDownloading(true)
    setError('')
    try {
      await applicationsApi.exportDownload(driveId, filename)
    } catch (err) {
      setError(err.message)
    } finally {
      setDownloading(false)
    }
  }

  const handleEmail = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')
    setSuccess('')
    try {
      const res = await applicationsApi.emailExport(driveId, email)
      setSuccess(res.message)
      setEmail('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="font-display text-lg font-semibold text-ink">Export applicant list</h2>
      <p className="mt-1 font-body text-xs text-slate">
        Download the roster as an Excel file, {canEmail ? 'or email it directly.' : 'for your records.'}
      </p>

      <ErrorBanner message={error} />
      {success && (
        <p className="mt-3 rounded-lg border border-forest/30 bg-forest/5 px-4 py-3 font-body text-sm text-forest">
          {success}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={handleDownload} disabled={downloading}>
          {downloading ? 'Preparing…' : '⬇ Download .xlsx'}
        </Button>
      </div>

      {canEmail && (
        <form onSubmit={handleEmail} className="mt-4 flex flex-wrap items-end gap-3 border-t border-border pt-4">
          <div className="min-w-[220px] flex-1">
            <Input
              label="Email this list to"
              type="email"
              placeholder="name@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={sending}>
            {sending ? 'Sending…' : 'Send email'}
          </Button>
        </form>
      )}
    </Card>
  )
}
