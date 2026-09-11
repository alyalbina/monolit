'use client';
import * as React from 'react';
import type { ContextItem, Draft, Mode } from '@/domain/types';
import type { Quote } from '@/adapters/types';
import { Button } from '@/ui/primitives/Button';
import { Badge } from '@/ui/primitives/Badge';
export type ComposerState = 'empty' | 'typing' | 'ready' | 'quote_loading' | 'submitting' | 'generating' | 'invalid' | 'disabled' | 'insufficient_balance' | 'rate_limited';
export interface ComposerProps { placement: 'empty' | 'docked'; draft: Draft; quote: Quote | null; state: ComposerState; parentLabel?: string; onChange: (d: Draft) => void; onRemoveContext: (i: number) => void; onReview: () => void; onRun: () => void; onCancel?: () => void; cancelRequested?: boolean }
/** Layout effect on the client, plain effect during SSR: lets width-dependent presentation be
 *  decided before paint without tripping React's server-rendering warning. */
const useIsoLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;
const MODE_LABEL: Record<Mode, string> = { flash: 'Flash', pro: 'Pro', ultima: 'Ultima' }; // Decision 03
/** Research/Composer — anatomy: textarea → context tray → toolbar (Add context, Mode, Run/Cancel) → scope/cost. Enter submits only in ready state; Shift+Enter newline; IME composition never submits (DOC-04). */
export function Composer(p: ComposerProps) {
  const ta = React.useRef<HTMLTextAreaElement>(null); const composing = React.useRef(false);
  // Narrow viewports are detected after mount so SSR and hydration agree (assume desktop first).
  const [narrow, setNarrow] = React.useState(false);
  useIsoLayoutEffect(() => { const w = () => setNarrow(window.innerWidth < 768); w(); window.addEventListener('resize', w); return () => window.removeEventListener('resize', w); }, []);
  const maxH = narrow ? 160 : 240;
  // SA §16: on mobile the docked Next composer collapses while reading and keeps its draft. It is a
  // disclosure, not a reset — the draft, context and quote are untouched while collapsed.
  const collapsible = p.placement === 'docked' && narrow;
  const [expanded, setExpanded] = React.useState(false);
  const open = !collapsible || expanded;
  React.useEffect(() => { if (open && collapsible) ta.current?.focus(); }, [open, collapsible]);
  React.useEffect(() => { const el = ta.current; if (!el) return; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, maxH) + 'px'; }, [p.draft.query, maxH]);
  const canRun = p.state === 'ready' && !!p.quote?.ok;
  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey && !composing.current) { e.preventDefault(); if (canRun) p.onRun(); } };
  const gate = p.quote && !p.quote.ok ? p.quote.reason : p.state === 'generating' ? 'Run available after the current run reaches a terminal state' : p.state === 'empty' ? 'Run becomes available after a valid question' : p.state === 'quote_loading' ? 'Checking scope and quote…' : null;
  if (collapsible && !expanded) {
    const preview = p.draft.query.trim();
    return <section aria-label="Next run composer" style={{ maxWidth: 840, margin: '0 auto' }}>
      <button type="button" onClick={() => setExpanded(true)} aria-expanded={false} aria-label="Expand next run composer"
        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', minHeight: 44, padding: '10px 16px', textAlign: 'left', background: 'var(--am-bg-surface)', border: '1px solid var(--am-border-default)', borderRadius: 12, color: 'inherit', font: '400 16px/26px var(--am-font-ui)', cursor: 'pointer', boxShadow: 'var(--am-e1)' }}>
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: preview ? 'inherit' : 'var(--am-text-tertiary)' }}>{preview || 'Ask a follow-up…'}</span>
        {p.draft.context.length > 0 && <Badge tone="neutral">{p.draft.context.length} context</Badge>}
        <span aria-hidden style={{ color: 'var(--am-text-tertiary)' }}>▲</span>
      </button>
    </section>;
  }
  return <section aria-label={p.placement === 'empty' ? 'Research composer' : 'Next run composer'} style={{ maxWidth: 840, margin: '0 auto', background: 'var(--am-bg-surface)', border: '1px solid var(--am-border-default)', borderRadius: 12, padding: 16, minHeight: p.placement === 'empty' ? 144 : 104, display: 'flex', flexDirection: 'column', gap: 12, boxSizing: 'border-box', boxShadow: p.placement === 'docked' ? 'var(--am-e1)' : 'none' }}>
    {collapsible && <button type="button" onClick={() => setExpanded(false)} aria-expanded style={{ alignSelf: 'flex-end', minHeight: 44, minWidth: 44, border: 'none', background: 'transparent', color: 'var(--am-text-secondary)', font: '400 14px/20px var(--am-font-ui)', cursor: 'pointer' }}>Collapse ▼</button>}
    {p.placement === 'docked' && <div style={{ display: 'flex', gap: 8, alignItems: 'center', font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-secondary)', flexWrap: 'wrap' }}><b>Next run</b>{p.parentLabel && <span>· Based on {p.parentLabel}</span>}</div>}
    <textarea ref={ta} value={p.draft.query} placeholder="Ask a market question or paste a wallet address…" aria-label="Research question" readOnly={p.state === 'submitting'} onCompositionStart={() => (composing.current = true)} onCompositionEnd={() => (composing.current = false)} onKeyDown={onKey} onChange={e => p.onChange({ ...p.draft, query: e.target.value, revision: p.draft.revision + 1 })} style={{ resize: 'none', border: 'none', outline: 'none', background: 'transparent', color: 'inherit', font: '400 16px/26px var(--am-font-ui)', minHeight: p.placement === 'empty' ? 52 : 26, maxHeight: maxH, overflow: 'auto' }} />
    {p.draft.context.length > 0 && <ul aria-label="Next context" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {p.draft.context.map((c, i) => <li key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 4px 0 8px', borderRadius: 8, font: '400 12px/18px var(--am-font-ui)', border: '1px solid ' + (c.status === 'invalid' ? 'var(--am-error-border)' : 'var(--am-border-default)'), background: c.status === 'invalid' ? 'var(--am-error-surface)' : 'var(--am-bg-surface)', color: c.status === 'invalid' ? 'var(--am-error-text)' : 'inherit' }}><span style={{ color: 'var(--am-text-tertiary)' }}>{c.kind === 'entity' ? c.entity?.type : c.kind}</span><span className={c.kind === 'entity' ? 'am-mono' : undefined}>{c.label}</span>{c.reason && <span>· {c.reason}</span>}<button type="button" className="am-hit" aria-label={'Remove ' + c.label + ' from next context'} onClick={() => p.onRemoveContext(i)} style={{ width: 24, height: 24, border: 'none', background: 'transparent', color: 'var(--am-text-tertiary)' }}>×</button></li>)}
    </ul>}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: p.draft.context.length ? '1px solid var(--am-border-subtle)' : 'none', paddingTop: p.draft.context.length ? 8 : 0, flexWrap: 'wrap' }}>
      <Button variant="ghost" size="sm">+ Add context</Button>
      <Button variant="ghost" size="sm" aria-haspopup="dialog">{MODE_LABEL[p.draft.mode]} ▾</Button>
      <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-secondary)' }}>
        {gate ? <span role="status" style={{ color: p.quote && !p.quote.ok ? 'var(--am-warning-text)' : undefined }}>{gate}</span> : p.quote?.ok && <><Badge tone="success">Scope ready</Badge><button type="button" className="am-hit" onClick={p.onReview} style={{ border: 'none', background: 'transparent', color: 'var(--am-text-link)', textDecoration: 'underline', font: 'inherit', padding: 0, cursor: 'pointer' }}>Cap {p.quote.capAmount.toFixed(2)} {p.quote.unit} · Review scope &amp; cost</button></>}
      </div>
      {p.state === 'generating' && p.onCancel ? <Button onClick={p.onCancel} loading={p.cancelRequested} disabled={p.cancelRequested}>{p.cancelRequested ? 'Cancellation requested…' : 'Cancel run'}</Button> : null}
      <Button variant="primary" onClick={p.onRun} disabled={!canRun} loading={p.state === 'submitting'} style={{ minWidth: 96 }}>{p.state === 'submitting' ? 'Starting…' : 'Run'}</Button>
    </div>
  </section>;
}
