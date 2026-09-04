import { Card } from './ui/primitives'

export default function StatCard({ label, value, sub }) {
  return (
    <Card className="px-6 py-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
      {sub && <p className="mt-1 font-body text-xs text-slate">{sub}</p>}
    </Card>
  )
}
