import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border bg-brand-soft">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-16 md:grid-cols-[1.1fr_0.9fr] md:pb-28 md:pt-24">
        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-slate">
            Placement season 2026–27 is live
          </div>

          <h1 className="max-w-xl font-display text-[2.75rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-6xl">
            Your campus career,
            <br />
            <span className="brand-text">connected end to end.</span>
          </h1>

          <p className="mt-6 max-w-md font-body text-[17px] leading-relaxed text-slate">
            NextGen CareerConnect is the university placement portal where students,
            the placement cell and recruiters work from the same live record —
            from drive announcement to final offer letter.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/register/student"
              className="rounded-full bg-brand px-6 py-3 font-body text-sm font-semibold text-white shadow-sm shadow-violet/20 transition hover:opacity-90"
            >
              Register as student
            </Link>
            <Link
              to="/register/recruiter"
              className="rounded-full border border-border bg-white px-6 py-3 font-body text-sm font-semibold text-ink transition hover:border-violet/40"
            >
              Register as recruiter
            </Link>
          </div>
        </div>

        <div className="relative flex items-center justify-center md:justify-end">
          <SnapshotCard />
        </div>
      </div>
    </section>
  )
}

function SnapshotCard() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-white shadow-xl shadow-violet/10">
      <div className="bg-brand px-7 py-6 text-white">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/80">
          Placement snapshot
        </p>
        <p className="mt-3 font-display text-4xl font-semibold">94%</p>
        <p className="mt-1 font-body text-sm text-white/85">of eligible students placed this cycle</p>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-border">
        {[
          ['1,284', 'Students registered'],
          ['312', 'Hiring partners'],
          ['94%', 'Placement rate'],
          ['₹42 LPA', 'Highest package'],
        ].map(([value, label]) => (
          <div key={label} className="px-6 py-5">
            <p className="font-display text-2xl font-semibold text-ink">{value}</p>
            <p className="mt-1 font-body text-xs text-slate">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
