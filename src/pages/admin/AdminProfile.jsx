import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { adminApi } from '../../lib/resourceApi'
import { authApi } from '../../lib/authApi'
import { Card, Badge, Button, Input, PageLoader, ErrorBanner } from '../../components/ui/primitives'

export default function AdminProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ phone: '', designation: '', department: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')

  const [admins, setAdmins] = useState([])
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', designation: '' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  const loadAll = async () => {
    try {
      const [{ profile: p }, adminsRes] = await Promise.all([adminApi.me(), adminApi.listAdmins({ limit: 50 })])
      setProfile(p)
      setForm({ phone: p?.phone || '', designation: p?.designation || '', department: p?.department || '' })
      setAdmins(adminsRes.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const updated = await adminApi.updateMe(form)
      setProfile(updated)
      setSuccess('Profile saved.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const onPwSubmit = async (e) => {
    e.preventDefault()
    setPwSaving(true)
    setPwError('')
    setPwSuccess('')
    try {
      await authApi.changePassword(pwForm)
      setPwSuccess('Password updated.')
      setPwForm({ currentPassword: '', newPassword: '' })
    } catch (err) {
      setPwError(err.errors?.map((x) => x.message).join(' · ') || err.message)
    } finally {
      setPwSaving(false)
    }
  }

  const onCreateAdmin = async (e) => {
    e.preventDefault()
    setCreating(true)
    setCreateError('')
    setCreateSuccess('')
    try {
      await adminApi.createAdmin(newAdmin)
      setCreateSuccess(`${newAdmin.name} can now log in as a placement-cell admin.`)
      setNewAdmin({ name: '', email: '', password: '', designation: '' })
      const adminsRes = await adminApi.listAdmins({ limit: 50 })
      setAdmins(adminsRes.data)
    } catch (err) {
      setCreateError(err.errors?.map((x) => x.message).join(' · ') || err.message)
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-magenta">Profile</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Your profile</h1>
        <p className="mt-1 font-body text-sm text-slate">
          {user?.name} · {user?.email}
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <Card className="space-y-5 p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Placement cell details</h2>
          <ErrorBanner message={error} />
          {success && (
            <p className="rounded-lg border border-forest/30 bg-forest/5 px-4 py-3 font-body text-sm text-forest">
              {success}
            </p>
          )}
          <Input id="designation" name="designation" label="Designation" value={form.designation} onChange={onChange} />
          <div className="grid grid-cols-2 gap-4">
            <Input id="department" name="department" label="Department" value={form.department} onChange={onChange} />
            <Input id="phone" name="phone" label="Phone" value={form.phone} onChange={onChange} />
          </div>
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? 'Saving…' : 'Save profile'}
          </Button>
        </Card>
      </form>

      <form onSubmit={onPwSubmit}>
        <Card className="space-y-5 p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Change password</h2>
          <ErrorBanner message={pwError} />
          {pwSuccess && (
            <p className="rounded-lg border border-forest/30 bg-forest/5 px-4 py-3 font-body text-sm text-forest">
              {pwSuccess}
            </p>
          )}
          <Input
            id="currentPassword"
            type="password"
            label="Current password"
            required
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
          />
          <Input
            id="newPassword"
            type="password"
            label="New password"
            hint="At least 8 characters, one uppercase letter, one number"
            required
            value={pwForm.newPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
          />
          <Button type="submit" disabled={pwSaving} className="w-full sm:w-auto">
            {pwSaving ? 'Updating…' : 'Update password'}
          </Button>
        </Card>
      </form>

      <form onSubmit={onCreateAdmin}>
        <Card className="space-y-5 p-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Create another admin</h2>
            <p className="mt-1 font-body text-xs text-slate">
              Only existing admins can create new placement-cell accounts — there's no public sign-up for this role.
            </p>
          </div>
          <ErrorBanner message={createError} />
          {createSuccess && (
            <p className="rounded-lg border border-forest/30 bg-forest/5 px-4 py-3 font-body text-sm text-forest">
              {createSuccess}
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name"
              required
              value={newAdmin.name}
              onChange={(e) => setNewAdmin((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              required
              value={newAdmin.email}
              onChange={(e) => setNewAdmin((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              hint="At least 8 characters, one uppercase letter, one number"
              required
              value={newAdmin.password}
              onChange={(e) => setNewAdmin((f) => ({ ...f, password: e.target.value }))}
            />
            <Input
              label="Designation (optional)"
              value={newAdmin.designation}
              onChange={(e) => setNewAdmin((f) => ({ ...f, designation: e.target.value }))}
            />
          </div>
          <Button type="submit" disabled={creating} className="w-full sm:w-auto">
            {creating ? 'Creating…' : 'Create admin account'}
          </Button>
        </Card>
      </form>

      <Card className="p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Placement cell members</h2>
        <ul className="divide-y divide-border">
          {admins.map((a) => (
            <li key={a.user._id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="font-body text-sm font-semibold text-ink">{a.user.name}</p>
                <p className="font-body text-xs text-slate">{a.user.email}</p>
              </div>
              {a.user._id === user?._id && <Badge tone="brand">You</Badge>}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
