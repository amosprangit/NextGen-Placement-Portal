import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from './ui/primitives'

const COLORS = { registered: '#4F6EF7', present: '#1F9D55', absent: '#E0399A', interviewed: '#8B5CF6' }

export default function DriveAnalyticsChart({ analytics }) {
  if (!analytics) return null

  const data = [
    { name: 'Registered', value: analytics.totalRegistered, fill: COLORS.registered },
    { name: 'Present', value: analytics.present, fill: COLORS.present },
    { name: 'Absent', value: analytics.absent, fill: COLORS.absent },
    { name: 'Interviewed', value: analytics.interviewGiven, fill: COLORS.interviewed },
  ]

  return (
    <Card className="p-6">
      <h2 className="mb-1 font-display text-lg font-semibold text-ink">Drive analytics</h2>
      <p className="mb-4 font-body text-xs text-slate">
        Registration, attendance and interview turnout for this drive.
      </p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E6F3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5B6472' }} axisLine={{ stroke: '#E7E6F3' }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#5B6472' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #E7E6F3', fontSize: 12, fontFamily: 'Source Sans 3' }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
        {data.map((d) => (
          <div key={d.name}>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate">{d.name}</p>
            <p className="mt-1 font-display text-xl font-semibold text-ink">{d.value}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
