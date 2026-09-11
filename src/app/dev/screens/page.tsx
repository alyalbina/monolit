// The gallery deliberately uses plain anchors rather than next/link: each entry must load its screen
// from scratch so a demo state is inspected in isolation, and so the page keeps working when the
// build is served as a static export from a plain file host.
import * as F from '@/adapters/demo/fixture';

/** Development-only screen gallery: every implemented route and demo state in one place, for
 *  inspecting the build. It is not part of the product IA and is not linked from the app shell. */

const SESSION = '/research/' + F.RESEARCH.id + '?run=' + F.RESEARCH.runId;

const GROUPS: { title: string; note: string; links: { label: string; href: string; note?: string }[] }[] = [
  {
    title: 'RES-01 · Research Home',
    note: 'LT-01 Staging. Prepare fills the composer and never runs.',
    links: [
      { label: 'First visit — empty composer', href: '/research/new', note: 'FR-001 · no saved research yet' },
      { label: 'Prepared from template', href: '/research/new', note: 'FR-021 · press Prepare on “Trace incoming wallet transfers”' },
    ],
  },
  {
    title: 'RES-02 · Active Research',
    note: 'LT-01 Output. Used snapshot is read-only; the Next draft is editable.',
    links: [
      { label: 'Completed + source inspector', href: SESSION, note: 'FR-002 · click a citation to open evidence' },
      { label: 'Partial — source unavailable', href: SESSION + '&demo=partial', note: 'FR-023 · RB-12 recovery, table kept' },
      { label: 'Failed — terminal error', href: SESSION + '&demo=terminal_error', note: 'FR-024 · usable output absent, draft kept' },
      { label: 'Status unknown — connection lost', href: SESSION + '&demo=status_unknown', note: 'FR-026 · reconcile by run ID, never re-submit' },
      { label: 'No results', href: SESSION + '&demo=no_results', note: 'checked absence, not zero' },
      { label: 'Stale source', href: SESSION + '&demo=stale', note: 'snapshot preserved with as-of time' },
      { label: 'Insufficient balance', href: SESSION + '&demo=insufficient_balance', note: 'draft preserved, Run gated' },
      { label: 'Save failed', href: SESSION + '&demo=save_failure', note: 'edits kept, status not masked' },
    ],
  },
  {
    title: 'WAL-01 · Wallet Detail',
    note: 'LT-03 Entity Detail. Activity is dominant; Investigate carries wallet + chain + window into a draft.',
    links: [
      { label: 'Populated wallet', href: '/wallet/solana/' + F.WALLET.full, note: 'FR-005 · filter Activity, then press Investigate' },
      { label: 'Counterparty wallet (outside fixture)', href: '/wallet/solana/' + F.FUNDERS[0].full, note: 'address not in the demo index' },
    ],
  },
  {
    title: 'MKT-01 · Market Intelligence',
    note: 'Discovery → Investigation. A vertical observation feed, not a ticker.',
    links: [
      { label: 'Feed + selected observation', href: '/market', note: 'FR-010 · Inspect and Investigate are separate actions' },
    ],
  },
  {
    title: 'Shell & overlays',
    note: 'Search is an overlay (OVR-01), not a route — open it with ⌘/Ctrl+K or the sidebar item.',
    links: [
      { label: 'Access / session recovery', href: '/access', note: 'SYS-01 · standalone shell, no private workspace' },
    ],
  },
  {
    title: 'Reserved routes',
    note: 'Route, shell and boundary note only — no invented data. Next implementation step.',
    links: [
      { label: 'Research Library (RES-03)', href: '/research' },
      { label: 'Template Catalog (RES-04)', href: '/research/templates' },
      { label: 'Entity Detail (ENT-01)', href: '/entity/token/jup' },
      { label: 'Saved (SAV-01)', href: '/saved' },
      { label: 'Chart Detail (DAT-01)', href: '/chart/art_0142' },
      { label: 'Account (ACC-01)', href: '/settings/account' },
      { label: 'Memory (ACC-02)', href: '/settings/memory' },
      { label: 'Billing (BIL-01)', href: '/settings/billing' },
    ],
  },
];

export default function DevScreens() {
  return <main style={{ padding: '48px 24px', maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
    <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ font: '400 12px/18px var(--am-font-mono)', color: 'var(--am-text-tertiary)' }}>Development only · not part of the product IA</span>
      <h1 style={{ margin: 0, font: '700 28px/36px var(--am-font-ui)', letterSpacing: -0.42 }}>Ask.Monolit — implemented screens</h1>
      <p style={{ margin: 0, color: 'var(--am-text-secondary)', maxWidth: 640 }}>
        Every route and demo state currently built. All data is the synthetic fixture (RS-2409 · {F.WALLET.short} · {F.WINDOW.short}) — nothing here touches a live source.
      </p>
    </header>

    {GROUPS.map(g => <section key={g.title} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h2 style={{ margin: 0, font: '700 18px/26px var(--am-font-ui)' }}>{g.title}</h2>
      <p style={{ margin: '0 0 4px', font: '400 13px/20px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>{g.note}</p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, border: '1px solid var(--am-border-subtle)', borderRadius: 8, background: 'var(--am-bg-surface)' }}>
        {g.links.map((l, i) => <li key={l.href + l.label} style={{ borderTop: i ? '1px solid var(--am-border-subtle)' : 'none' }}>
          <a href={l.href} className="am-row" style={{ display: 'flex', alignItems: 'center', gap: 16, minHeight: 48, padding: '10px 16px', textDecoration: 'none', color: 'inherit', flexWrap: 'wrap' }}>
            <span style={{ flex: '1 1 240px', font: '700 14px/20px var(--am-font-ui)' }}>{l.label}</span>
            {l.note && <span style={{ flex: '1 1 220px', font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>{l.note}</span>}
          </a>
        </li>)}
      </ul>
    </section>)}
  </main>;
}
