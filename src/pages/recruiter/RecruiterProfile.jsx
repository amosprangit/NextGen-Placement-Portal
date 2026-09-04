import { useEffect, useState } from 'react'
import { recruitersApi } from '../../lib/resourceApi'
import { Card, Badge, Button, Input, Textarea, PageLoader, ErrorBanner } from '../../components/ui/primitives'

const emptyForm = { companyName: '', designation: '', industry: '', website: '', phone: '', about: '' }

export default function RecruiterProfile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [logoFile, setLogoFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const p = await recruitersApi.me()
        setProfile(p)
        setForm({
          companyName: p.companyName || '',
          designation: p.designation || '',
          industry: p.industry || '',
          website: p.website || '',
          phone: p.phone || '',
          about: p.about || '',
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
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (logoFile) fd.append('logo', logoFile)
      const updated = await recruitersApi.updateMe(fd)
      setProfile(updated)
      setSuccess('Profile saved.')
      setLogoFile(null)
    } catch (err) {
      setError(err.errors?.map((x) => x.message).join(' · ') || err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-magenta">Profile</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Company profile</h1>
        </div>
        <Badge tone={profile?.isApproved ? 'success' : 'pending'}>
          {profile?.isApproved ? 'Approved' : 'Pending approval'}
        </Badge>
      </div>

      <form onSubmit={onSubmit}>
        <Card className="space-y-5 p-6">
          <ErrorBanner message={error} />
          {success && (
            <p className="rounded-lg border border-forest/30 bg-forest/5 px-4 py-3 font-body text-sm text-forest">
              {success}
            </p>
          )}

          <Input id="companyName" name="companyName" label="Company name" required value={form.companyName} onChange={onChange} />
          <div className="grid grid-cols-2 gap-4">
            <Input id="designation" name="designation" label="Your designation" value={form.designation} onChange={onChange} />
            <Input id="industry" name="industry" label="Industry" value={form.industry} onChange={onChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input id="website" name="website" label="Website" value={form.website} onChange={onChange} />
            <Input id="phone" name="phone" label="Phone" value={form.phone} onChange={onChange} />
          </div>
          <Textarea id="about" name="about" label="About the company" rows={4} value={form.about} onChange={onChange} />

          <div>
            <span className="mb-1.5 block font-body text-sm font-medium text-ink">Company logo</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
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
