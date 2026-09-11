'use client';
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Route } from 'next';
import { AppShell } from '@/ui/shell/AppShell';
import { Button } from '@/ui/primitives/Button';
import { putPreparedDraft } from '@/features/research/preparedDraft';
import * as F from '@/adapters/demo/fixture';

/** WAL-01 Wallet Detail — LT-03 Entity Detail (FR-005).
 *  An investigation workspace, not an explorer clone and not a portfolio: Activity is dominant, every
 *  number carries its unit and window, and nothing here infers ownership from observed transfers. */

type Filter = 'all' | 'Received' | 'Sent';

const SECTION_TITLE: React.CSSProperties = { margin: 0, font: '700 18px/26px var(--am-font-ui)' };
const CARD: React.CSSProperties = { border: '1px solid var(--am-border-subtle)', background: 'var(--am-bg-surface)' };

export function WalletView() {
  const { chainId, address } = useParams<{ chainId: string; address: string }>();
  const router = useRouter();
  const [filter, setFilter] = React.useState<Filter>('all');
  const [copied, setCopied] = React.useState(false);

  // The route carries the canonical address; the fixture's own wallet is the one with observed data.
  const isFixtureWallet = address === F.WALLET.full;
  const short = isFixtureWallet ? F.WALLET.short : address.slice(0, 4) + '…' + address.slice(-4);
  const chainLabel = chainId.charAt(0).toUpperCase() + chainId.slice(1);

  const rows = React.useMemo(
    () => F.ACTIVITY.map((a, i) => ({ ...a, tx: F.ACTIVITY_TX[i] })).filter(a => filter === 'all' || a.action === filter),
    [filter],
  );

  const copyAddress = async () => {
    // Copy the full canonical identity, never the truncated display form.
    try { await navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ }
  };

  /** Investigate prepares a research draft with wallet + chain + window. It never runs (Blueprint §13). */
  const investigate = () => {
    putPreparedDraft({
      query: 'Trace incoming transfers to ' + short + ' over ' + F.WINDOW.short + '.',
      context: [
        { kind: 'entity', label: 'Wallet ' + short + ' · ' + chainLabel, status: 'valid',
          entity: { type: 'wallet', chain: 'solana', id: address, display: short } },
        { kind: 'window', label: F.WINDOW.label,
          window: { startUtc: '2026-09-04T00:00:00Z', endUtc: '2026-09-11T00:00:00Z', tz: 'UTC', label: F.WINDOW.label } },
      ],
      originLabel: 'Wallet ' + short + ' · ' + chainLabel,
      originHref: '/wallet/' + chainId + '/' + address,
    });
    router.push('/research/new' as Route);
  };

  return <AppShell header={<>
    <span style={{ font: '700 14px/20px var(--am-font-ui)' }}>Wallet</span>
    <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>{chainLabel} · investigated address</span>
  </>}>
    <div style={{ padding: '24px 24px 48px', display: 'flex', flexDirection: 'column', gap: 32, minWidth: 0 }}>

      {/* R01 — identity, canonical address, and the two distinct research actions. */}
      <section style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <span aria-hidden style={{ width: 40, height: 40, borderRadius: 9999, background: 'var(--am-bg-active)', flex: 'none', display: 'grid', placeItems: 'center', color: 'var(--am-text-secondary)', font: '700 14px/20px var(--am-font-ui)' }}>W</span>
        <div style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, font: '700 22px/30px var(--am-font-ui)', letterSpacing: -0.22 }}>{short}</h1>
            <span style={{ font: '700 12px/18px var(--am-font-ui)', padding: '2px 8px', border: '1px solid var(--am-border-default)', borderRadius: 4 }}>{chainLabel}</span>
            <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>Investigated address · not connected · no ownership claim</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="am-mono" style={{ padding: '6px 8px', border: '1px solid var(--am-border-subtle)', borderRadius: 4, background: 'var(--am-bg-surface)' }}>{address}</span>
            <Button size="sm" onClick={copyAddress} aria-label={'Copy full wallet address on ' + chainLabel}>{copied ? 'Copied' : 'Copy'}</Button>
            <span role="status" className="am-sr">{copied ? 'Full address copied' : ''}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flex: 'none', flexWrap: 'wrap' }}>
          <Button onClick={investigate}>Add to current research</Button>
          <Button variant="primary" onClick={investigate}>Investigate →</Button>
        </div>
      </section>

      {/* R02 — window, as-of and coverage. Each clause names the source it came from. */}
      <section aria-label="Window and coverage" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', padding: '12px 16px', border: '1px solid var(--am-border-subtle)', borderRadius: 8, background: 'var(--am-bg-surface)', font: '400 14px/22px var(--am-font-ui)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><span style={{ color: 'var(--am-text-tertiary)' }}>Window</span>{F.WINDOW.label}<Button size="sm">Change period ▾</Button></span>
        <span><span style={{ color: 'var(--am-text-tertiary)' }}>As-of</span> {F.RESEARCH.snapshot}</span>
        <span><span style={{ color: 'var(--am-text-tertiary)' }}>Coverage</span> {F.WALLET_COVERAGE.transfers} · {F.WALLET_COVERAGE.labels} · <span style={{ color: 'var(--am-warning-text)' }}>{F.WALLET_COVERAGE.prices}</span></span>
      </section>

      {/* R03 — observed flows per asset. Assets are never summed without a valuation method. */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={SECTION_TITLE}>Observed flows</h2>
          <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>Per asset · window above · source [1]</span>
        </div>
        <div style={{ ...CARD, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {F.FLOWS.map(m => <div key={m.label} style={{ padding: '12px 16px', borderRight: '1px solid var(--am-border-subtle)', display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>{m.label}</span>
            <span className="am-num" style={{ font: '700 18px/26px var(--am-font-ui)', fontVariantNumeric: 'tabular-nums lining-nums', color: m.value === '—' ? 'var(--am-text-tertiary)' : m.value.startsWith('+') ? 'var(--am-market-positive)' : 'var(--am-text-primary)' }}>
              {m.value} <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>{m.unit}</span>
            </span>
            <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>{m.sub}</span>
          </div>)}
        </div>
        <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>Assets are not summed — no valuation method or price source in this fixture. USDC net excludes 2 unresolved incoming transfers.</span>
      </section>

      {/* R04 — Activity, the dominant region. */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={SECTION_TITLE}>Activity</h2>
          <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>{F.WALLET_ACTIVITY_TOTAL} transfers in window · showing {rows.length} · sorted by time</span>
        </div>
        <div role="group" aria-label="Filter activity" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {(['all', 'Received', 'Sent'] as const).map(f => <button key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f}
            className="am-btn" style={{ height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid transparent', cursor: 'pointer', font: '700 14px/20px var(--am-font-ui)', background: filter === f ? 'var(--am-int-selected)' : 'transparent', color: filter === f ? 'var(--am-int-selected-text)' : 'var(--am-text-secondary)' }}>
            {f === 'all' ? 'All' : f}
          </button>)}
        </div>
        <div tabIndex={0} role="group" aria-label="Activity — scrollable table" style={{ ...CARD, overflowX: 'auto', maxWidth: '100%' }}>
          <table className="am-num am-table" style={{ width: '100%', minWidth: 940, borderCollapse: 'collapse', font: '400 14px/24px var(--am-font-ui)', fontVariantNumeric: 'tabular-nums lining-nums' }}>
            <caption className="am-sr">Observed transfers for {short} on {chainLabel} within {F.WINDOW.label}</caption>
            <thead><tr style={{ color: 'var(--am-text-secondary)', textAlign: 'left' }}>
              {['Time (UTC)', 'Action', 'Asset', 'Amount', 'Counterparty', 'Transaction', 'Evidence'].map((h, i) =>
                <th key={h} scope="col" style={{ padding: 'var(--am-cell-pad)', borderBottom: '1px solid var(--am-border-subtle)', textAlign: i === 3 ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>)}
            </tr></thead>
            <tbody>{rows.map(a => <tr key={a.time + a.cp} className="am-row" style={{ height: 'var(--am-row-h)', borderBottom: '1px solid var(--am-border-subtle)', background: a.amount === null ? 'var(--am-warning-surface)' : undefined }}>
              <td style={{ padding: 'var(--am-cell-pad)', whiteSpace: 'nowrap' }}>{a.time}</td>
              <td style={{ padding: 'var(--am-cell-pad)' }}>{a.action}</td>
              <td style={{ padding: 'var(--am-cell-pad)' }}>{a.asset}</td>
              {/* Missing data reads as unavailable, never as zero. */}
              <td style={{ padding: 'var(--am-cell-pad)', textAlign: 'right', whiteSpace: 'nowrap', color: a.amount === null ? 'var(--am-warning-text)' : undefined }}>{a.amount ?? '— unavailable'}</td>
              <td className="am-mono" style={{ padding: 'var(--am-cell-pad)' }}>{a.cp}</td>
              <td className="am-mono" style={{ padding: 'var(--am-cell-pad)', color: 'var(--am-text-secondary)' }}>{a.tx}</td>
              <td style={{ padding: 'var(--am-cell-pad)' }}>
                <span style={{ font: '700 12px/18px var(--am-font-ui)', padding: '0 5px', border: '1px solid var(--am-border-subtle)', borderRadius: 4, color: a.ref === 2 ? 'var(--am-warning-text)' : 'var(--am-text-link)' }}>[{a.ref}]</span>
              </td>
            </tr>)}</tbody>
          </table>
        </div>
        <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>“— unavailable” = amount not decoded by source [2]; not zero. Transfer ≠ trade.</span>
      </section>

      {/* R05 / R06 / R07 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, minWidth: 0 }}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
          <h2 style={SECTION_TITLE}>Incoming counterparties</h2>
          <div style={CARD}>
            {F.FUNDERS.slice(0, 5).map(r => <div key={r.from} className="am-row" style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 44, padding: '8px 16px', borderBottom: '1px solid var(--am-border-subtle)', font: '400 14px/22px var(--am-font-ui)', flexWrap: 'wrap' }}>
              <span className="am-mono">{r.from}</span>
              <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)', flex: '1 1 80px', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label ? 'Exchange hot wallet · [3]' : ''}</span>
              <span className="am-num" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>{r.amount ?? '— unavailable'} USDC</span>
              <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>{r.n} tx</span>
            </div>)}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 44, padding: '8px 16px', font: '400 14px/22px var(--am-font-ui)', flexWrap: 'wrap' }}>
              <span style={{ flex: '1 1 200px', color: 'var(--am-text-secondary)' }}>Trace incoming transfers · Wallet {short} · {chainLabel} · this window</span>
              <Button size="sm" onClick={investigate}>Prepare</Button>
            </div>
          </div>
          <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>Observed transfers only. Label from [3] is a registry entry, not ownership.</span>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 style={SECTION_TITLE}>Related research</h2>
            <a href={'/research/' + F.RESEARCH.id + '?run=' + F.RESEARCH.runId} className="am-row" style={{ display: 'flex', alignItems: 'center', gap: 16, minHeight: 56, padding: '12px 16px', ...CARD, borderRadius: 8, textDecoration: 'none', color: 'var(--am-text-primary)', flexWrap: 'wrap' }}>
              <span style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ font: '700 14px/20px var(--am-font-ui)' }}>{F.RESEARCH.title}</span>
                <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>Run 1 · completed {F.RESEARCH.completed} · same window</span>
              </span>
              <span style={{ font: '400 14px/20px var(--am-font-ui)', color: 'var(--am-text-secondary)' }}>Open →</span>
            </a>
          </section>
          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 style={SECTION_TITLE}>Method and sources</h2>
            <div style={{ font: '400 14px/22px var(--am-font-ui)', color: 'var(--am-text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {F.SOURCES.map(s => <span key={s.n}>[{s.n}] {s.name} · {s.time} · <b style={{ color: s.fresh === 'Fresh' ? 'var(--am-success-text)' : 'var(--am-warning-text)' }}>{s.fresh}</b></span>)}
              <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>Received / Sent = SPL transfer direction relative to this address. No trade classification.</span>
            </div>
          </section>
        </div>
      </div>

      {!isFixtureWallet && <p role="status" style={{ margin: 0, padding: '12px 16px', border: '1px solid var(--am-info-border)', borderRadius: 8, background: 'var(--am-info-surface)', color: 'var(--am-info-text)', font: '400 14px/22px var(--am-font-ui)' }}>
        This address is not in the demo fixture. The activity above belongs to {F.WALLET.short} and is shown so the screen structure is inspectable.
      </p>}
    </div>
  </AppShell>;
}
