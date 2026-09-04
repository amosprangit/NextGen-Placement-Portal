import { Link } from 'react-router-dom'

export default function Cta() {
  return (
    <section className="relative overflow-hidden bg-brand">
      <div className="mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/80">
          Registrations for the 2026–27 cycle close on 15 September
        </p>
        <h2 className="mx-auto mt-4 max-w-xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Set up your profile now so you never miss an eligible drive.
        </h2>
        <Link
          to="/register/student"
          className="mt-8 inline-block rounded-full bg-white px-7 py-3 font-body text-sm font-semibold text-ink transition hover:bg-white/90"
        >
          Create your profile
        </Link>
      </div>
    </section>
  )
}
