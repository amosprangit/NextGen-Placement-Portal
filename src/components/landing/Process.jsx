const steps = [
  { n: '01', title: 'Complete profile', body: 'Academic record, resume and preferences verified once by the placement cell.' },
  { n: '02', title: 'Apply to drives', body: 'Only eligible drives appear; apply in a click and track the deadline.' },
  { n: '03', title: 'Attend rounds', body: 'Aptitude, technical and HR schedules land in your timeline with venue details.' },
  { n: '04', title: 'Accept the offer', body: 'Offer letters, CTC breakdown and joining dates stay in one signed record.' },
]

export default function Process() {
  return (
    <section id="process" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-magenta">Sequence</p>
        <h2 className="mt-2 max-w-lg font-display text-3xl font-semibold tracking-tight text-ink">How a placement runs here.</h2>

        <div className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-border lg:block" />
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <span className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-violet/30 bg-white font-mono text-sm font-semibold text-violet">
                {s.n}
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-slate">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
