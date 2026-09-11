'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { AppShell } from '@/ui/shell/AppShell';
import { Button } from '@/ui/primitives/Button';
import { putPreparedDraft } from '@/features/research/preparedDraft';
import * as F from '@/adapters/demo/fixture';

/** MKT-01 Market Intelligence — Discovery → Investigation (FR-010).
 *  A vertical feed of observations, not a ticker: every row states what was observed, against which
 *  baseline and window, and from which source. New events never reorder what the user is reading. */

type Event = (typeof F.EVENTS)[number];

export function MarketView() {
  const router = useRouter();
  const [selected, setSelected] = React.useState<string | null>(F.EVENTS.find(e => e.selected)?.id ?? null);
  const [showNew, setShowNew] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  const event = F.EVENTS.find(e => e.id === selected) ?? null;
  const detail = event ? F.EVENT_DETAIL[event.id] : undefined;

  const inspect = (e: Event, el: HTMLElement | null) => { triggerRef.current = el; setSelected(e.id); };
  const closeInspector = () => { const t = triggerRef.current; setSelected(null); requestAnimationFrame(() => t?.focus()); };

  /** Investigate carries the fact, entity, window and source reference into a draft. It does not run. */
  const investigate = (e: Event) => {
    putPreparedDraft({
      query: e.fact + ' — what explains this?',
      context: [
        { kind: 'observation', label: e.entity, ref: e.id, status: 'valid' },
        { kind: 'window', label: e.window },
      ],
      originLabel: 'Market observation · ' + e.entity,
      originHref: '/market',
    });
    router.push('/research/new' as Route);
  };

  const inspector = event ? <div className="am-panel-enter" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
    <div style={{ height: 56, flex: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px 0 16px', borderBottom: '1px solid var(--am-border-subtle)' }}>
      <b style={{ font: '700 14px/20px var(--am-font-ui)' }}>Observation</b>
      <button type="button" aria-label="Close observation inspector" onClick={closeInspector} style={{ marginLeft: 'auto', width: 32, height: 32, border: '1px solid var(--am-border-subtle)', borderRadius: 8, background: 'transparent', color: 'inherit', cursor: 'pointer' }}>×</button>
    </div>
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16, font: '400 14px/22px var(--am-font-ui)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>{detail?.kind ?? event.type + ' · ' + event.id}</span>
        <b style={{ font: '700 18px/26px var(--am-font-ui)' }}>{detail?.headline ?? event.fact}</b>
      </div>

      {detail && <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 12px', border: '1px solid var(--am-border-subtle)', borderRadius: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span aria-hidden style={{ width: 24, height: 24, borderRadius: 9999, background: 'var(--am-bg-active)', display: 'grid', placeItems: 'center', font: '700 10px/12px var(--am-font-ui)', color: 'var(--am-text-secondary)' }}>{detail.entity.symbol}</span>
          <b style={{ font: '700 14px/20px var(--am-font-ui)' }}>{detail.entity.label}</b>
        </div>
        <span className="am-mono" style={{ color: 'var(--am-text-secondary)' }}>{detail.entity.contract}</span>
        <div style={{ display: 'flex', gap: 12, font: '400 12px/18px var(--am-font-ui)', flexWrap: 'wrap' }}>
          <a href={'/entity/token/' + detail.entity.symbol.toLowerCase()}>Open entity →</a>
        </div>
      </div>}

      <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', margin: 0, font: '400 12px/18px var(--am-font-ui)' }}>
        {(detail?.rows ?? [['Observed value', event.metric + ' ' + event.unit], ['Baseline', event.baseline], ['Window', event.window], ['Source', event.source]] as [string, string][]).map(([k, v]) =>
          <React.Fragment key={k}><dt style={{ color: 'var(--am-text-tertiary)' }}>{k}</dt><dd className={k === 'Observed value' ? 'am-num' : undefined} style={{ margin: 0 }}>{v}</dd></React.Fragment>)}
        {detail && <><dt style={{ color: 'var(--am-text-tertiary)' }}>Coverage</dt><dd style={{ margin: 0, color: 'var(--am-info-text)' }}>{detail.coverage}</dd></>}
      </dl>

      {detail && <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--am-border-subtle)', paddingTop: 12 }}>
        <span style={{ font: '700 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)', paddingBottom: 4 }}>Underlying daily volume · USDC-eq</span>
        {detail.series.map(v => <div key={v.d} style={{ display: 'flex', gap: 8, minHeight: 32, alignItems: 'center', borderTop: '1px solid var(--am-border-subtle)', font: '400 12px/18px var(--am-font-ui)' }}>
          <span style={{ color: 'var(--am-text-tertiary)', width: 64, flex: 'none' }}>{v.d}</span>
          <div style={{ flex: 1, height: 8, background: 'var(--am-bg-hover)', borderRadius: 2 }}><div style={{ height: 8, background: 'var(--am-chart-s1)', borderRadius: 2, width: v.w }} /></div>
          <span className="am-num" style={{ width: 56, textAlign: 'right', flex: 'none', fontVariantNumeric: 'tabular-nums lining-nums' }}>{v.v}</span>
        </div>)}
        <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)', paddingTop: 4 }}>{detail.seriesNote}</span>
      </div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--am-border-subtle)', paddingTop: 12 }}>
        <Button variant="primary" onClick={() => investigate(event)} style={{ width: '100%' }}>Investigate →</Button>
        <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>Investigate prepares a draft with the fact, entity, window and source reference. It does not run.</span>
      </div>
    </div>
  </div> : undefined;

  return <AppShell inspector={inspector} header={<>
    <h1 style={{ margin: 0, font: '700 14px/20px var(--am-font-ui)' }}>Market</h1>
    <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>{F.MARKET_ASOF}</span>
  </>}>
    <div style={{ padding: '16px 24px 48px', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
      <div role="group" aria-label="Filters" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {['Type · All', 'Chain / venue · Solana + Venue A', 'Metric · All', 'Observed · last 24 h'].map((f, i) =>
          <Button key={f} size="sm" style={i === 1 ? { borderColor: 'var(--am-border-selected)', background: 'var(--am-int-selected)', color: 'var(--am-int-selected-text)' } : undefined}>{f} ▾</Button>)}
      </div>

      {/* New observations are announced, never auto-inserted above what is being read (SA §18). */}
      {!showNew && <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', border: '1px solid var(--am-info-border)', borderRadius: 8, background: 'var(--am-info-surface)', font: '400 14px/20px var(--am-font-ui)', color: 'var(--am-info-text)', flexWrap: 'wrap' }}>
        <span style={{ flex: '1 1 200px' }}>{F.MARKET_NEW_EVENTS}</span>
        <Button size="sm" onClick={() => setShowNew(true)}>Show new events</Button>
      </div>}

      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--am-border-subtle)', background: 'var(--am-bg-surface)', minWidth: 0 }}>
        <ul aria-label="Observations" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {F.EVENTS.map(e => {
            const isSel = e.id === selected;
            return <li key={e.id} className="am-row" aria-current={isSel ? true : undefined} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 16px 10px 14px', minHeight: 56, borderBottom: '1px solid var(--am-border-subtle)', background: isSel ? 'var(--am-int-selected)' : undefined, borderLeft: '2px solid ' + (isSel ? 'var(--am-border-selected)' : 'transparent'), flexWrap: 'wrap' }}>
              <span style={{ width: 110, flex: 'none', font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)', paddingTop: 2 }}>{e.type}</span>
              <span style={{ flex: '1 1 220px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ font: '400 14px/22px var(--am-font-ui)' }}>{e.fact}</span>
                <span className="am-mono" style={{ color: 'var(--am-text-secondary)' }}>{e.entity}</span>
              </span>
              <span className="am-num" style={{ width: 120, flex: 'none', textAlign: 'right', font: '700 14px/22px var(--am-font-ui)', fontVariantNumeric: 'tabular-nums lining-nums', color: e.metric.startsWith('−') ? 'var(--am-market-negative)' : e.metric.startsWith('+') ? 'var(--am-market-positive)' : 'var(--am-text-primary)' }}>
                {e.metric} <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>{e.unit}</span>
              </span>
              <span style={{ width: 190, flex: 'none', font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-secondary)' }}>{e.baseline}<br />{e.window}</span>
              <span style={{ width: 150, flex: 'none', font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>{e.source}<br />{e.time}</span>
              {/* Inspect and Investigate are separate actions, never one ambiguous target. */}
              <span style={{ display: 'flex', gap: 8, flex: 'none', paddingTop: 2 }}>
                <Button size="sm" variant="ghost" onClick={ev => inspect(e, ev.currentTarget)} aria-label={'Inspect observation: ' + e.fact}>Inspect</Button>
                <Button size="sm" onClick={() => investigate(e)} aria-label={'Investigate: ' + e.fact}>Investigate</Button>
              </span>
            </li>;
          })}
        </ul>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}>
          <Button size="sm">Load more · {F.EVENTS.length} of {F.MARKET_TOTAL}</Button>
        </div>
      </div>
    </div>
  </AppShell>;
}
