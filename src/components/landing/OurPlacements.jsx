import { useEffect, useMemo, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Sample data — swap this for real data later by passing a `placements` prop
// (same shape) from wherever you fetch it, e.g. a public "placed students"
// endpoint. Falls back to this sample set so the section always renders.
// ---------------------------------------------------------------------------
const SAMPLE_PLACEMENTS = [
  {
    id: 1,
    name: "Aanya Kulkarni",
    photo: null,
    company: "Aurora Systems",
    package: "₹18 LPA",
    batch: 2026,
    year: 2026,
    course: "B.Tech · CS",
  },
  {
    id: 2,
    name: "Rohan Mehta",
    photo: null,
    company: "Northwind Analytics",
    package: "₹11 LPA",
    batch: 2026,
    year: 2026,
    course: "MCA",
  },
  {
    id: 3,
    name: "Sara Iyer",
    photo: null,
    company: "Helios Fintech",
    package: "₹14 LPA",
    batch: 2026,
    year: 2025,
    course: "B.Tech · IT",
  },
  {
    id: 4,
    name: "Kabir Anand",
    photo: null,
    company: "Verta Robotics",
    package: "₹22 LPA",
    batch: 2025,
    year: 2025,
    course: "M.Tech",
  },
  {
    id: 5,
    name: "Priya Nair",
    photo: null,
    company: "Quanta Cloud",
    package: "₹16 LPA",
    batch: 2025,
    year: 2025,
    course: "BCA",
  },
  {
    id: 6,
    name: "Dev Sharma",
    photo: null,
    company: "Orbit Labs",
    package: "₹42 LPA",
    batch: 2025,
    year: 2024,
    course: "B.Tech · CS",
  },
  {
    id: 7,
    name: "Meera Pillai",
    photo: null,
    company: "Aurora Systems",
    package: "₹13 LPA",
    batch: 2024,
    year: 2024,
    course: "BBA",
  },
  {
    id: 8,
    name: "Arjun Rao",
    photo: null,
    company: "Northwind Analytics",
    package: "₹19 LPA",
    batch: 2024,
    year: 2024,
    course: "B.Tech · ECE",
  },
];

const COMPANY_MARQUEE = [
  "Aurora Systems",
  "Northwind Analytics",
  "Helios Fintech",
  "Verta Robotics",
  "Quanta Cloud",
  "Orbit Labs",
  "Brightpath Consulting",
  "Meridian Health",
];

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

// Deterministic little hash so the same name always gets the same accent —
// keeps the grid visually varied without needing per-record color data.
const ACCENTS = [
  "from-blue to-violet",
  "from-violet to-magenta",
  "from-magenta to-blue",
  "from-blue via-violet to-magenta",
];
const accentFor = (seed) => {
  const n = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);
  return ACCENTS[n % ACCENTS.length];
};

// ---------------------------------------------------------------------------
// Tiny scroll-reveal hook — no extra dependency, just IntersectionObserver.
// ---------------------------------------------------------------------------
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // reveal once, don't re-animate on scroll-back
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

function PlacementCard({ p, index }) {
  const [ref, inView] = useInView(0.15);
  const accent = useMemo(
    () => accentFor(p.name + p.company),
    [p.name, p.company],
  );

  return (
    <div
      ref={ref}
      style={{ transitionDelay: inView ? `${(index % 8) * 70}ms` : "0ms" }}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-white transition-all duration-700 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-violet/10 ${
        inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      {/* gradient accent bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} />

      <div className="p-5">
        <div className="flex items-center gap-3">
          {p.photo ? (
            <img
              src={p.photo}
              alt={p.name}
              className="h-14 w-14 flex-none rounded-full object-cover ring-2 ring-border transition group-hover:ring-violet/40"
            />
          ) : (
            <div
              className={`flex h-14 w-14 flex-none items-center justify-center rounded-full bg-gradient-to-br ${accent} font-display text-lg font-semibold text-white shadow-sm`}
            >
              {initials(p.name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-display text-base font-semibold text-ink">
              {p.name}
            </p>
            <p className="truncate font-body text-xs text-slate">{p.course}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate">
              Placed at
            </p>
            <p className="truncate font-body text-sm font-semibold text-ink">
              {p.company}
            </p>
          </div>
          <div className="flex-none text-right">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate">
              Package
            </p>
            <p className="bg-gradient-to-r from-blue via-violet to-magenta bg-clip-text font-display text-sm font-semibold text-transparent">
              {p.package}
            </p>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <span className="rounded-full border border-border bg-bg px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-slate">
            Batch {p.batch}
          </span>
          <span className="rounded-full border border-border bg-bg px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-slate">
            Placed {p.year}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function OurPlacements({ placements = SAMPLE_PLACEMENTS }) {
  const years = useMemo(
    () => [
      "All",
      ...Array.from(new Set(placements.map((p) => p.year))).sort(
        (a, b) => b - a,
      ),
    ],
    [placements],
  );
  const [activeYear, setActiveYear] = useState("All");

  const filtered = useMemo(
    () =>
      activeYear === "All"
        ? placements
        : placements.filter((p) => p.year === activeYear),
    [placements, activeYear],
  );

  const stats = useMemo(() => {
    const packages = placements
      .map((p) => parseFloat(String(p.package).replace(/[^\d.]/g, "")))
      .filter((n) => !Number.isNaN(n));
    const highest = packages.length ? Math.max(...packages) : 0;
    const companies = new Set(placements.map((p) => p.company)).size;
    return { total: placements.length, highest, companies };
  }, [placements]);

  return (
    <section
      id="placements"
      className="relative overflow-hidden border-b border-border bg-white"
    >
      <div className="mx-auto max-w-6xl px-6 py-20">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-magenta">
              Wall of placements
            </p>
            <h2 className="mt-2 max-w-lg font-display text-3xl font-semibold tracking-tight text-ink">
              Students who found their next role{" "}
              <span className="brand-text">through us.</span>
            </h2>
            <p className="mt-3 max-w-md font-body text-sm text-slate">
              A running record of who got placed, where, and for how much —
              updated every cycle.
            </p>
          </div>

          {/* Stat pills */}
          <div className="flex gap-4">
            <div className="rounded-xl border border-border bg-bg px-4 py-3 text-center">
              <p className="font-display text-xl font-semibold text-ink">
                {stats.total}+
              </p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-slate">
                Placed
              </p>
            </div>
            <div className="rounded-xl border border-border bg-bg px-4 py-3 text-center">
              <p className="font-display text-xl font-semibold text-ink">
                ₹{stats.highest} LPA
              </p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-slate">
                Highest
              </p>
            </div>
            <div className="rounded-xl border border-border bg-bg px-4 py-3 text-center">
              <p className="font-display text-xl font-semibold text-ink">
                {stats.companies}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-slate">
                Companies
              </p>
            </div>
          </div>
        </div>

        {/* Year filter tabs */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setActiveYear(y)}
              className={`flex-none rounded-full px-4 py-2 font-body text-sm font-medium transition ${
                activeYear === y
                  ? "bg-brand text-white shadow-sm shadow-violet/20"
                  : "border border-border bg-white text-slate hover:border-violet/40 hover:text-ink"
              }`}
            >
              {y === "All" ? "All years" : y}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p, i) => (
            <PlacementCard key={p.id} p={p} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-10 text-center font-body text-sm text-slate">
            No placements recorded for this year yet.
          </p>
        )}
      </div>

      {/* Hiring-partners marquee */}
      <div className="border-t border-border bg-brand-soft py-10">
        <p className="mb-5 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-slate">
          Hiring partners
        </p>
        <div className="marquee-mask relative overflow-hidden">
          <div className="placements-marquee-track flex w-max gap-3">
            {[...COMPANY_MARQUEE, ...COMPANY_MARQUEE].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="flex-none rounded-full border border-border bg-white px-5 py-2.5 font-body text-sm font-medium text-ink shadow-sm"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scoped keyframes for the marquee — no tailwind.config changes needed */}
      <style>{`
        @keyframes placementsMarqueeScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .placements-marquee-track {
          animation: placementsMarqueeScroll 28s linear infinite;
        }
        .placements-marquee-track:hover {
          animation-play-state: paused;
        }
        .marquee-mask {
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        }
        @media (prefers-reduced-motion: reduce) {
          .placements-marquee-track { animation: none; }
        }
      `}</style>
    </section>
  );
}
