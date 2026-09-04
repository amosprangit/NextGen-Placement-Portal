import { Link } from 'react-router-dom'

const groups = [
  {
    tag: 'I',
    title: 'Students',
    body: 'One profile, every drive. Upload your resume, check eligibility instantly and follow each application from applied to offer.',
    items: ['Eligibility-aware drive feed', 'Resume & document vault', 'Interview schedule and results'],
    cta: { label: 'Register as student', to: '/register/student' },
  },
  {
    tag: 'II',
    title: 'Placement Cell',
    body: 'Publish drives, filter cohorts by CGPA and branch, and share verified shortlists with recruiters without spreadsheets.',
    items: ['Drive builder with criteria', 'Batch analytics & reports', 'Bulk notifications'],
    cta: { label: 'Placement cell login', to: '/login' },
  },
  {
    tag: 'III',
    title: 'Recruiters',
    body: 'Post a role, receive pre-screened candidates and run the whole hiring round on a single timeline.',
    items: ['Verified student profiles', 'Round-wise shortlisting', 'Offer roll-out tracking'],
    cta: { label: 'Register as recruiter', to: '/register/recruiter' },
  },
]

export default function Perspectives() {
  return (
    <section id="roles" className="border-b border-border bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-magenta">Three points of view</p>
        <h2 className="mt-2 max-w-lg font-display text-3xl font-semibold tracking-tight text-ink">One portal, every side of the table.</h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {groups.map((g) => (
            <div key={g.title} className="flex flex-col rounded-2xl border border-border bg-bg/60 px-7 py-8 transition hover:border-violet/30 hover:shadow-lg hover:shadow-violet/5">
              <span className="brand-text font-display text-sm font-semibold">{g.tag}</span>
              <h3 className="mt-3 font-display text-xl font-semibold text-ink">{g.title}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-slate">{g.body}</p>
              <ul className="mt-6 space-y-2.5 border-t border-border pt-5">
                {g.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 font-body text-sm text-ink">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to={g.cta.to}
                className="mt-6 font-body text-sm font-semibold text-violet underline decoration-violet/40 underline-offset-4 hover:decoration-violet"
              >
                {g.cta.label} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
