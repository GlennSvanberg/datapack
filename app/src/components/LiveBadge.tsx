import { useConvex } from 'convex/react'

export function LiveBadge() {
  const convex = useConvex()
  const state = convex.connectionState()

  if (state.kind === 'closed') return null

  const connected = state.kind === 'connected'
  const label =
    state.kind === 'connecting'
      ? 'Connecting'
      : state.kind === 'connected'
        ? 'Live'
        : 'Reconnecting'

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] px-2.5 py-0.5 text-xs text-[var(--text-secondary)]">
      <span
        className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-[var(--accent-green)]' : 'bg-[var(--accent-orange)] animate-pulse'}`}
      />
      {label}
    </span>
  )
}
