import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  accent?: 'blue' | 'green' | 'orange'
}

const accentClasses = {
  blue: 'text-[var(--accent)]',
  green: 'text-[var(--accent-green)]',
  orange: 'text-[var(--accent-orange)]',
}

export function StatCard({ label, value, icon: Icon, accent = 'blue' }: StatCardProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
        <Icon className={`h-4 w-4 ${accentClasses[accent]}`} />
      </div>
      <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  )
}
