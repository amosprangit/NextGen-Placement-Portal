export function Button({ as: As = 'button', variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-body text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5'
  const variants = {
    primary: 'bg-brand text-white shadow-sm shadow-violet/20 hover:opacity-90',
    outline: 'border border-border bg-white text-ink hover:border-violet/40',
    ghost: 'text-slate hover:text-ink hover:bg-white',
    danger: 'bg-white border border-rose-200 text-rose-600 hover:bg-rose-50',
  }
  return <As className={`${base} ${variants[variant]} ${className}`} {...props} />
}

export function Input({ label, error, hint, className = '', id, ...props }) {
  return (
    <label className="block" htmlFor={id}>
      {label && <span className="mb-1.5 block font-body text-sm font-medium text-ink">{label}</span>}
      <input
        id={id}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 font-body text-sm text-ink placeholder:text-slate/60 focus:outline-none focus:ring-2 focus:ring-violet/30 ${
          error ? 'border-rose-300' : 'border-border'
        } ${className}`}
        {...props}
      />
      {hint && !error && <span className="mt-1 block font-body text-xs text-slate">{hint}</span>}
      {error && <span className="mt-1 block font-body text-xs text-rose-600">{error}</span>}
    </label>
  )
}

export function Textarea({ label, error, className = '', id, ...props }) {
  return (
    <label className="block" htmlFor={id}>
      {label && <span className="mb-1.5 block font-body text-sm font-medium text-ink">{label}</span>}
      <textarea
        id={id}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 font-body text-sm text-ink placeholder:text-slate/60 focus:outline-none focus:ring-2 focus:ring-violet/30 ${
          error ? 'border-rose-300' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block font-body text-xs text-rose-600">{error}</span>}
    </label>
  )
}

export function Select({ label, error, className = '', id, children, ...props }) {
  return (
    <label className="block" htmlFor={id}>
      {label && <span className="mb-1.5 block font-body text-sm font-medium text-ink">{label}</span>}
      <select
        id={id}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-violet/30 ${
          error ? 'border-rose-300' : 'border-border'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="mt-1 block font-body text-xs text-rose-600">{error}</span>}
    </label>
  )
}

export function Card({ className = '', children }) {
  return <div className={`rounded-2xl border border-border bg-white ${className}`}>{children}</div>
}

const badgeTones = {
  neutral: 'text-slate border-border bg-bg',
  open: 'text-forest border-forest/30 bg-forest/5',
  success: 'text-forest border-forest/30 bg-forest/5',
  pending: 'text-amber border-amber/30 bg-amber/5',
  warning: 'text-amber border-amber/30 bg-amber/5',
  danger: 'text-rose-600 border-rose-200 bg-rose-50',
  brand: 'text-violet border-violet/30 bg-violet/5',
}

export function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${badgeTones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function Spinner({ className = '' }) {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 border-border border-t-violet ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate">
      <Spinner className="h-7 w-7" />
      <p className="font-body text-sm">{label}</p>
    </div>
  )
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-white/60 px-6 py-16 text-center">
      <p className="font-display text-lg text-ink">{title}</p>
      {body && <p className="max-w-sm font-body text-sm text-slate">{body}</p>}
      {action}
    </div>
  )
}

export function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 font-body text-sm text-rose-700">
      {message}
    </div>
  )
}
