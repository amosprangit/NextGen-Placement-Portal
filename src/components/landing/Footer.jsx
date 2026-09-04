export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-10 text-center">
        <span className="flex items-baseline gap-1.5 font-display text-sm font-semibold">
          <span className="text-blue">NextGen</span>
          <span className="text-magenta">·</span>
          <span className="text-magenta">CareerConnect</span>
        </span>
        <p className="font-body text-xs text-slate">
          University Placement Cell · placements@university.edu
        </p>
      </div>
    </footer>
  )
}
