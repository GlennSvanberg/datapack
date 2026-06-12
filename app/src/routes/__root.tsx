import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ConvexProvider } from 'convex/react'

import { LiveBadge } from '#/components/LiveBadge'
import { convex } from '#/lib/convex/client'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Friluftsportalen — DataPack Dashboard' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <header className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.svg" alt="Friluftsportalen" className="h-8" />
              <span className="text-sm text-[var(--text-secondary)]">DataPack Dashboard</span>
            </Link>
            <LiveBadge />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">
          <Outlet />
        </main>
      </div>
    </ConvexProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
