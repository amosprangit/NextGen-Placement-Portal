const drives = [
  { code: 'A', company: 'Aurora Systems', role: 'Software Engineer', pkg: '₹18 LPA', deadline: '28 Aug', status: 'Open' },
  { code: 'N', company: 'Northwind Analytics', role: 'Data Analyst', pkg: '₹11 LPA', deadline: '02 Sep', status: 'Open' },
  { code: 'H', company: 'Helios Fintech', role: 'Product Intern', pkg: '₹60k/mo', deadline: '05 Sep', status: 'Shortlisting' },
  { code: 'V', company: 'Verta Robotics', role: 'Embedded Engineer', pkg: '₹14 LPA', deadline: '11 Sep', status: 'Upcoming' },
]

const statusStyle = {
  Open: 'text-forest border-forest/30 bg-forest/5',
  Shortlisting: 'text-amber border-amber/30 bg-amber/5',
  Upcoming: 'text-slate border-slate/25 bg-slate/5',
}

export default function Drives() {
  return (
    <section id="drives" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-magenta">Live</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">Upcoming drives</h2>
            <p className="mt-2 max-w-md font-body text-sm text-slate">
              A preview of what's on the portal — sign in to see live drives and apply.
            </p>
          </div>
        </div>

        <div className="mt-2 divide-y divide-border">
          {drives.map((d) => (
            <div
              key={d.company}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5 sm:grid-cols-[auto_1fr_auto_auto_auto]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-display text-sm font-semibold text-white">
                {d.code}
              </span>

              <div>
                <p className="font-body text-[15px] font-semibold text-ink">{d.company}</p>
                <p className="font-body text-sm text-slate">{d.role}</p>
              </div>

              <span className="hidden font-mono text-sm text-ink sm:block">{d.pkg}</span>
              <span className="hidden font-mono text-xs text-slate sm:block">Deadline {d.deadline}</span>

              <span
                className={`col-span-3 mt-2 w-fit rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider sm:col-span-1 sm:mt-0 ${statusStyle[d.status]}`}
              >
                {d.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
