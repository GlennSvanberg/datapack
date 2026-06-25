import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Activity,
  BadgeCheck,
  Brain,
  FileSpreadsheet,
  Fingerprint,
  Network,
  Radar,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const Route = createFileRoute('/report/product-data-future')({
  component: ProductDataFutureReport,
})

interface Force {
  title: string
  description: string
  icon: LucideIcon
}

interface EvolutionStep {
  stage: string
  label: string
  description: string
}

const forces: Force[] = [
  {
    title: 'AI makes content abundant',
    description:
      'Descriptions, translations, buying guides, comparisons, and attribute enrichment can now be generated at machine speed. The result is more content, but also more confident-looking errors.',
    icon: Brain,
  },
  {
    title: 'Compliance raises the floor',
    description:
      'Digital Product Passports, green claims rules, energy labels, safety documents, and sector-specific declarations all push product facts toward evidence, timestamps, and accountable issuers.',
    icon: ShieldCheck,
  },
  {
    title: 'The digital shelf becomes continuous',
    description:
      'Product pages, marketplaces, search results, configurators, and AI shopping agents are no longer periodic destinations. They are live surfaces that constantly reinterpret product data.',
    icon: Radar,
  },
  {
    title: 'Exports lose accountability',
    description:
      'Excel, PDFs, XML feeds, and one-way syndication still move data, but once copied downstream the source usually loses visibility into usage, drift, and update paths.',
    icon: FileSpreadsheet,
  },
]

const evolution: EvolutionStep[] = [
  {
    stage: '01',
    label: 'Dead data',
    description:
      'A product record is exported, imported, copied, edited, and eventually separated from the source that knew why it was true.',
  },
  {
    stage: '02',
    label: 'Syndicated data',
    description:
      'PIMs, feeds, APIs, and retailer templates improve distribution, but the flow is still mostly one-way and channel-specific.',
  },
  {
    stage: '03',
    label: 'Observable data',
    description:
      'Manufacturers begin to see where product facts appear, which partners use them, and how downstream versions differ from source.',
  },
  {
    stage: '04',
    label: 'Verified data',
    description:
      'Important facts carry issuer, version, timestamp, evidence, validity, and confidence. The question shifts from "what does it say?" to "who can prove it?"',
  },
  {
    stage: '05',
    label: 'Subscribed data',
    description:
      'High-risk fields stop being copied and become source-connected: certificates, compatibility, product status, safety, DPP, CO2, and technical claims.',
  },
  {
    stage: '06',
    label: 'Agent-readable data',
    description:
      'AI assistants and commerce agents need trusted product facts. The winning sources are not the loudest pages, but the most authoritative and machine-readable ones.',
  },
]

function ProductDataFutureReport() {
  return (
    <article className="space-y-10">
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="relative px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-3xl" />
          <div className="relative max-w-3xl">
            <Link
              to="/"
              className="mb-8 inline-flex text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Back to dashboard
            </Link>
            <p className="mb-4 inline-flex rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
              Field report
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl">
              The future of product data is connected, observable, and verified.
            </h1>
            <p className="mt-6 text-lg leading-8 text-[var(--text-secondary)]">
              Product data has spent decades travelling as files: exported, emailed, imported,
              remapped, copied, enriched, and slowly forgotten. That model is starting to break.
              AI makes content cheap, regulation raises the cost of being wrong, and digital
              commerce surfaces now change faster than the teams meant to govern them.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 lg:col-span-2">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
            <Fingerprint className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">The shift is from records to facts.</h2>
          <p className="mt-4 leading-7 text-[var(--text-secondary)]">
            A product page is not a single record. It is a bundle of claims: this fits, this
            weighs, this replaces, this is certified, this emits, this is safe, this is official.
            Some claims are creative and local. Others are technical, legal, or operational. The
            next layer of product data infrastructure will distinguish between generated content
            and verified product facts.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">North star</p>
          <p className="mt-5 text-2xl font-semibold leading-9">
            Product data should remain connected to its source after it is distributed.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Forces in motion
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Why the old export model is under pressure</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {forces.map((force) => (
            <section
              key={force.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-[var(--accent)]">
                <force.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium">{force.title}</h3>
              <p className="mt-3 leading-7 text-[var(--text-secondary)]">{force.description}</p>
            </section>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 sm:p-8">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">
            The emerging operating model
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            From "send and pray" to publish, observe, verify, update
          </h2>
          <p className="mt-4 leading-7 text-[var(--text-secondary)]">
            The destination is not one universal widget or one new file format. It is a loop:
            discover where facts appear, compare them to source, score the risk of drift, push
            corrections, and make the highest-risk facts connected instead of copied.
          </p>
        </div>
        <div className="mt-8 grid gap-3">
          {evolution.map((step) => (
            <div
              key={step.stage}
              className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 sm:grid-cols-[5rem_12rem_1fr]"
            >
              <span className="font-mono text-sm text-[var(--accent)]">{step.stage}</span>
              <h3 className="font-medium">{step.label}</h3>
              <p className="leading-7 text-[var(--text-secondary)]">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <InsightCard
          icon={BadgeCheck}
          title="Verified core"
          body="Technical specifications, certificates, safety data, product status, replacement logic, CO2, DPP, and compliance claims become accountable facts with provenance."
        />
        <InsightCard
          icon={Sparkles}
          title="Generated surround"
          body="SEO copy, channel-specific descriptions, translations, comparisons, and buying guides can be AI-assisted as long as they are grounded in verified source facts."
        />
        <InsightCard
          icon={Activity}
          title="Usage telemetry"
          body="Every connected delivery path can report what was used, by whom, at which version, and where downstream copies have drifted from the source."
        />
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
              <Network className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold">This is not only about live data.</h2>
            <p className="mt-4 leading-7 text-[var(--text-secondary)]">
              "Live" is only one mechanism. The deeper change is that product facts need a
              connection back to the authority that issued them. Sometimes that connection is a
              crawl, a diff, a signed data package, a DPP link, an API subscription, a PIM
              connector, or a tiny verified block on a product page.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-5">
            <p className="mb-4 text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Practical question
            </p>
            <p className="text-xl font-medium leading-8">
              Which product facts are too risky, too expensive, or too important to remain dead
              copies?
            </p>
            <div className="mt-6 grid gap-3 text-sm text-[var(--text-secondary)]">
              <Pill>Observable: where is it used?</Pill>
              <Pill>Verifiable: who issued it?</Pill>
              <Pill>Updateable: what happens when it changes?</Pill>
              <Pill>Measurable: did the correction reach the shelf?</Pill>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold">The likely future</h2>
            <p className="mt-4 leading-7 text-[var(--text-secondary)]">
              Product data will not become fully live overnight. It will become selectively
              connected. The facts that carry commercial, technical, legal, or trust risk will get
              provenance first. Everything else can remain flexible, channel-specific, and even
              AI-generated.
            </p>
          </div>
          <Link
            to="/demo/retailer"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            View current embed lab
          </Link>
        </div>
      </section>
    </article>
  )
}

function InsightCard({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon
  title: string
  body: string
}) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-[var(--accent)]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-3 leading-7 text-[var(--text-secondary)]">{body}</p>
    </section>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2">
      {children}
    </span>
  )
}
