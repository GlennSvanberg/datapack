import { Link } from '@tanstack/react-router'
import type { PackRegistryEntry } from '#/lib/types'

interface PackTableProps {
  packs: PackRegistryEntry[]
}

export function PackTable({ packs }: PackTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-[var(--text-secondary)]">
            <th className="pb-3 pr-4 font-medium">Assortment</th>
            <th className="pb-3 pr-4 font-medium">Pack ID</th>
            <th className="pb-3 pr-4 font-medium">Products</th>
            <th className="pb-3 pr-4 font-medium">Version</th>
            <th className="pb-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {packs.map((pack) => (
            <tr
              key={pack.packId}
              className="border-b border-[var(--border)]/50 hover:bg-[var(--bg-hover)]"
            >
              <td className="py-3 pr-4 font-medium text-[var(--text-primary)]">
                {pack.assortment}
              </td>
              <td className="py-3 pr-4 font-mono text-xs text-[var(--text-secondary)]">
                {pack.packId}
              </td>
              <td className="py-3 pr-4 text-[var(--text-secondary)]">{pack.productCount}</td>
              <td className="py-3 pr-4 text-[var(--text-secondary)]">v{pack.version}</td>
              <td className="py-3">
                <Link
                  to="/packs/$packId"
                  params={{ packId: pack.packId }}
                  className="text-[var(--accent)] hover:text-[var(--accent-hover)]"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
