'use client';
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { AppShell } from '@/ui/shell/AppShell';
import { Composer, type ComposerState } from '@/features/research/Composer';
import { useDraft } from '@/features/research/useDraft';
import { Dialog } from '@/ui/primitives/Dialog';
import { Button } from '@/ui/primitives/Button';
import { getAdapter } from '@/adapters';
import { takePreparedDraft, type PreparedDraft } from '@/features/research/preparedDraft';
import type { Draft } from '@/domain/types';
const STARTERS = [
  { id: 'TMP-01', title: 'Track smart-money buying', vars: ['Chain · Solana', 'Window · last 7 days', 'Cohort · required definition'], out: 'Trades table + cohort definition' },
  { id: 'TMP-02', title: 'Trace incoming wallet transfers', vars: ['Wallet address · required', 'Chain', 'Timeframe · last 7 days'], out: 'Transfer graph + source table', preview: 'Map the upstream funder graph of [wallet address]' }, // Decision 04
  { id: 'TMP-03', title: 'Compare funding rates', vars: ['Asset · BTC', 'Venues · ≥2', 'Window · required'], out: 'Comparable funding table' },
];
/** RES-01 Research Home — LT-01 Staging. Prepare fills the draft and focuses the first empty parameter; it never runs. */
export default function ResearchNew() {
  const router = useRouter();
  const { draft, setDraft, quote, saving, preflight } = useDraft({ draftId: 'd_home', query: '', context: [], mode: 'flash', revision: 0, savedState: 'saved' });
  const [review, setReview] = React.useState(false); const [submitting, setSubmitting] = React.useState(false); const idem = React.useRef<string>('idem_' + Date.now());
  // Context Carry: a draft handed over by Investigate / Ask arrives with its entity, window and
  // origin intact. Receiving it fills the composer and stops — Run still has to be pressed.
  const [origin, setOrigin] = React.useState<PreparedDraft | null>(null);
  React.useEffect(() => {
    const carried = takePreparedDraft();
    if (!carried) return;
    setOrigin(carried);
    setDraft(d => ({ ...d, query: carried.query, context: carried.context, revision: d.revision + 1 }));
  }, [setDraft]);
  const state: ComposerState = submitting ? 'submitting' : quote && !quote.ok ? 'invalid' : quote?.ok ? 'ready' : draft.query || draft.context.length ? 'quote_loading' : 'empty';
  const prepare = (t: typeof STARTERS[number]) => { if (t.id !== 'TMP-02') return; setDraft((d: Draft) => ({ ...d, query: t.preview!, context: [{ kind: 'entity', label: '[wallet address]', status: 'invalid', reason: 'required', entity: { type: 'wallet', id: '', display: '[wallet address]' } }], revision: d.revision + 1 })); setTimeout(() => document.querySelector<HTMLTextAreaElement>('textarea')?.focus(), 0); };
  const run = async () => { const q = await preflight(); if (!q.ok) return; setReview(true); };
  const accept = async () => { setReview(false); setSubmitting(true); try { const r = await getAdapter().submitRun(draft, idem.current, quote!.revision); router.push(('/research/' + r.researchId + '?run=' + r.runId) as Route); } finally { setSubmitting(false); } };
  return <AppShell header={<><span style={{ font: '700 14px/20px var(--am-font-ui)' }}>New research</span><span role="status" style={{ font: '400 12px/18px var(--am-font-ui)', color: saving === 'save_failed' ? 'var(--am-error-text)' : saving === 'saved' ? 'var(--am-success-text)' : 'var(--am-text-tertiary)' }}>{saving === 'idle' ? 'Draft not started' : saving === 'saving' ? 'Saving…' : saving === 'saved' ? 'Draft saved' : 'Save failed · edits kept'}</span></>}>
    <div style={{ padding: '80px 24px 64px', display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 840, margin: '0 auto' }}>
      <div><h1 style={{ margin: 0, font: '700 28px/36px var(--am-font-ui)', letterSpacing: -0.42 }}>Investigate a wallet, token, or market.</h1><p style={{ margin: '8px 0 0', color: 'var(--am-text-secondary)', maxWidth: 760 }}>Ask a question. Check the data, sources, and time window behind the answer.</p></div>
      {origin && <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', border: '1px solid var(--am-info-border)', borderRadius: 8, background: 'var(--am-info-surface)', color: 'var(--am-info-text)', font: '400 13px/20px var(--am-font-ui)', flexWrap: 'wrap' }}>
        <span style={{ flex: '1 1 240px' }}>Prepared from <b>{origin.originLabel}</b> — entity, window and source came with it. Nothing has run yet.</span>
        <a href={origin.originHref} style={{ font: '400 12px/18px var(--am-font-ui)' }}>Back to origin</a>
      </div>}
      <Composer placement="empty" draft={draft} quote={quote} state={state} onChange={setDraft} onRemoveContext={i => setDraft({ ...draft, context: draft.context.filter((_, j) => j !== i), revision: draft.revision + 1 })} onReview={() => setReview(true)} onRun={run} />
      <div><h2 style={{ margin: '0 0 8px', font: '700 14px/20px var(--am-font-ui)', color: 'var(--am-text-secondary)' }}>Start from an executable template</h2>
        {STARTERS.map(t => <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', minHeight: 56, padding: '12px 16px', borderTop: '1px solid var(--am-border-subtle)', background: 'var(--am-bg-surface)' }}><div style={{ flex: '1 1 220px', minWidth: 0 }}><div style={{ font: '700 14px/20px var(--am-font-ui)' }}>{t.title}</div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>{t.vars.map(v => <span key={v} style={{ font: '400 12px/18px var(--am-font-ui)', padding: '2px 8px', border: '1px solid var(--am-border-subtle)', borderRadius: 4, color: 'var(--am-text-secondary)' }}>{v}</span>)}</div></div><span style={{ flex: '1 1 180px', minWidth: 0, font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>→ {t.out}</span><Button size="sm" onClick={() => prepare(t)} aria-label={'Prepare ' + t.title}>Prepare</Button></div>)}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--am-border-subtle)' }}><Link href="/research/templates">Browse templates →</Link></div></div>
    </div>
    <Dialog open={review} onClose={() => setReview(false)} title="Review scope and cost">
      <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', margin: 0, font: '400 14px/22px var(--am-font-ui)' }}><dt style={{ color: 'var(--am-text-tertiary)' }}>Question</dt><dd style={{ margin: 0 }}>{draft.query}</dd><dt style={{ color: 'var(--am-text-tertiary)' }}>Mode</dt><dd style={{ margin: 0 }}>Flash</dd><dt style={{ color: 'var(--am-text-tertiary)' }}>Cost</dt><dd style={{ margin: 0 }}><b>Cap {quote?.capAmount.toFixed(2)} {quote?.unit}</b> · the cap is enforced, not the estimate</dd></dl>
      <p style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-info-text)', background: 'var(--am-info-surface)', border: '1px solid var(--am-info-border)', borderRadius: 8, padding: '8px 12px' }}>Changing query, context, window, mode or sources invalidates this review.</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Button onClick={() => setReview(false)}>Cancel · keep draft</Button><Button variant="primary" onClick={accept} disabled={!quote?.ok}>Accept and Run</Button></div>
    </Dialog>
  </AppShell>;
}
