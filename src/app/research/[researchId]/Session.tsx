'use client';
import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { AppShell } from '@/ui/shell/AppShell';
import { Composer } from '@/features/research/Composer';
import { useDraft } from '@/features/research/useDraft';
import { Badge } from '@/ui/primitives/Badge';
import { Button } from '@/ui/primitives/Button';
import { getAdapter, applyDemoScenario } from '@/adapters';
import type { Research, Run, SourceSnapshot } from '@/domain/types';
import { ResultBlock } from './ResultBlocks';
import { displayStatus, isTerminal } from '@/domain/runLifecycle';
import { utcStamp } from '@/domain/format';
/** RES-02 Research Session — LT-01 Output. Used snapshot read-only (R03); Next draft editable (R08); claim → citation → inspector (R09) with focus return (P-04). */
export function Session() {
  const { researchId } = useParams<{ researchId: string }>(); const sp = useSearchParams();
  const [res, setRes] = React.useState<Research | null>(null); const [run, setRun] = React.useState<Run | null>(null); const [source, setSource] = React.useState<{ s: SourceSnapshot; claim: string; trigger: HTMLElement | null } | null>(null); const [unknown, setUnknown] = React.useState(false);
  const draftHook = useDraft({ draftId: 'd_next', researchId, query: '', context: [], mode: 'flash', revision: 0, savedState: 'saved' });
  // The saved Next draft is hydrated once. A ref (not draftHook in the dep list) guards it, because
  // depending on the hook object would rebuild `load` every render and re-trigger the effect below.
  const setDraft = draftHook.setDraft;
  const hydrated = React.useRef(false);
  const load = React.useCallback(async () => {
    const r = await getAdapter().getResearch(researchId);
    setRes(r);
    const runId = sp.get('run') ?? r?.runs[r.runs.length - 1]?.runId;
    if (!runId) return;
    try {
      const ru = await getAdapter().getRun(runId);
      setRun(ru);
      setUnknown(false);
    } catch {
      // A failed status read is a client knowledge gap, never a terminal run state (DOC-03).
      // Keep showing the last confirmed snapshot so the user retains the output they already had —
      // reconciliation happens by run ID, and nothing is re-submitted.
      setRun(prev => prev ?? r?.runs.find(x => x.runId === runId) ?? null);
      setUnknown(true);
    }
    if (r?.drafts[0] && !hydrated.current) { hydrated.current = true; setDraft({ ...r.drafts[0], revision: 1 }); }
  }, [researchId, sp, setDraft]);
  // ?demo=<scenario> selects the fixture state (DOC-05) before anything is read, so QA and visual
  // regression can reproduce partial / failed / status-unknown without a backend.
  React.useEffect(() => { applyDemoScenario(sp.get('demo')); }, [sp]);
  React.useEffect(() => { load(); }, [load]);
  /** Next run: one active run per research, and the quote must still match the draft revision. */
  const runNext = React.useCallback(async () => {
    if (run && !isTerminal(run.status)) return;
    const q = await draftHook.preflight();
    if (!q.ok) return;
    await getAdapter().submitRun(draftHook.draft, 'idem_' + researchId + '_' + draftHook.draft.revision, q.revision);
    load();
  }, [run, draftHook, researchId, load]);
  React.useEffect(() => { if (!run || isTerminal(run.status) || unknown) return; const t = setInterval(load, 1500); return () => clearInterval(t); }, [run, unknown, load]);
  const openSource = async (ref: string, claim: string, e: React.MouseEvent<HTMLButtonElement>) => {
    // Capture the element before awaiting: React clears currentTarget once the handler returns, so
    // reading it after the await yields null and the P-04 focus return silently stops working.
    const trigger = e.currentTarget;
    const s = await getAdapter().getSource(ref);
    if (s) setSource({ s, claim, trigger });
  };
  // Close restores focus to the citation the inspector was opened from (P-04). The focus call is
  // deferred one frame so it lands after React has removed the inspector, not before.
  const closeSource = () => { const t = source?.trigger; setSource(null); requestAnimationFrame(() => t?.focus()); };
  /** A follow-up seeds the Next draft only. The Used snapshot of the shown run is untouched (P-03). */
  const prepareFollowUp = React.useCallback((query: string) => { setDraft(d => ({ ...d, query, revision: d.revision + 1 })); }, [setDraft]);
  const active = run ? !isTerminal(run.status) : false;
  const state = active ? 'generating' : draftHook.quote?.ok ? 'ready' : draftHook.draft.query ? 'quote_loading' : 'empty';
  const cite = (ref: string, claim: string, state: 'available' | 'stale' | 'partial' | 'unavailable') => <button type="button" className="am-hit am-cite" onClick={e => openSource(ref, claim, e)} aria-label={'Source ' + ref + ' for: ' + claim} style={{ font: '700 12px/18px var(--am-font-ui)', padding: '0 5px', borderRadius: 4, border: '1px solid ' + (state === 'unavailable' ? 'var(--am-error-border)' : state === 'stale' ? 'var(--am-warning-border)' : 'var(--am-border-subtle)'), background: state === 'unavailable' ? 'var(--am-error-surface)' : 'transparent', color: state === 'unavailable' ? 'var(--am-error-text)' : 'var(--am-text-link)', cursor: 'pointer' }}>{ref}{state === 'unavailable' ? ' ✕' : ''}</button>;
  return <AppShell header={<><span style={{ font: '700 14px/20px var(--am-font-ui)' }}>{res?.title ?? '…'}</span><span role="status" style={{ font: '400 12px/18px var(--am-font-ui)', color: unknown ? 'var(--am-warning-text)' : draftHook.saving === 'save_failed' ? 'var(--am-error-text)' : 'var(--am-success-text)' }}>{unknown ? 'Offline · local edits kept' : draftHook.saving === 'save_failed' ? 'Save failed · edits kept' : draftHook.saving === 'saving' ? 'Saving…' : 'Saved'}</span></>}
    inspector={source ? <div className="am-panel-enter" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, font: '400 14px/22px var(--am-font-ui)' }}><div style={{ display: 'flex', alignItems: 'center' }}><b>Source</b><button type="button" aria-label="Close source inspector" onClick={closeSource} style={{ marginLeft: 'auto', width: 32, height: 32, border: '1px solid var(--am-border-subtle)', borderRadius: 8, background: 'transparent', color: 'inherit' }}>×</button></div><div style={{ borderLeft: '2px solid var(--am-border-selected)', paddingLeft: 8 }}>{source.claim}</div><b>[{source.s.sourceRef}] {source.s.name}</b><Badge tone={source.s.state === 'available' ? 'success' : source.s.state === 'stale' ? 'warning' : source.s.state === 'unavailable' ? 'error' : 'info'}>{source.s.state} · {source.s.freshness}</Badge><dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', margin: 0, font: '400 12px/18px var(--am-font-ui)' }}><dt style={{ color: 'var(--am-text-tertiary)' }}>Snapshot</dt><dd style={{ margin: 0 }}>{source.s.snapshotAt ? utcStamp(source.s.snapshotAt) : 'none retrieved'}</dd><dt style={{ color: 'var(--am-text-tertiary)' }}>Retrieved</dt><dd style={{ margin: 0 }}>{utcStamp(source.s.retrievedAt)}</dd><dt style={{ color: 'var(--am-text-tertiary)' }}>Coverage</dt><dd style={{ margin: 0 }}>{source.s.coverage}</dd></dl>{source.s.externalUrl ? <a href={source.s.externalUrl}>Open source record</a> : <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>No live explorer URL in this fixture.</span>}</div> : undefined}
    footer={<Composer placement="docked" draft={draftHook.draft} quote={draftHook.quote} state={state} parentLabel={run ? run.runId.replace('run_0', 'Run ') + (active ? ' (running)' : '') : undefined} onChange={draftHook.setDraft} onRemoveContext={i => draftHook.setDraft({ ...draftHook.draft, context: draftHook.draft.context.filter((_, j) => j !== i), revision: draftHook.draft.revision + 1 })} onReview={() => {}} onRun={runNext} onCancel={run && !unknown ? async () => setRun(await getAdapter().cancelRun(run.runId)) : undefined} cancelRequested={run?.status === 'cancel_requested'} />}>
    <div style={{ padding: '24px 24px 0', paddingBottom: 'calc(var(--am-dock-h, 200px) + 32px)', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 32, minWidth: 0 }}>
      {run && <>
        <section style={{ maxWidth: 760 }}><div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Button size="sm" aria-haspopup="listbox">{run.runId.replace('run_0', 'Run ')} · {displayStatus(run.status, run.knowledge)} ▾</Button><span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>{run.acceptedAt && 'Accepted ' + utcStamp(run.acceptedAt)}{run.parentRunId ? ' · parent ' + run.parentRunId : ' · first run'}</span></div><p style={{ margin: '8px 0 0' }}>{run.query}</p></section>
        <section aria-label="Used in this run" style={{ maxWidth: 760, padding: '12px 16px', border: '1px solid var(--am-border-subtle)', borderRadius: 8, background: 'var(--am-bg-surface)' }}><div style={{ font: '700 12px/18px var(--am-font-ui)', color: 'var(--am-text-secondary)' }}>🔒 Used in this run <span style={{ fontWeight: 400, color: 'var(--am-text-tertiary)' }}>· read-only snapshot</span></div><dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 16px', margin: '8px 0 0', font: '400 14px/22px var(--am-font-ui)' }}>{run.used.items.map((c, i) => <React.Fragment key={i}><dt style={{ color: 'var(--am-text-tertiary)' }}>{c.kind}</dt><dd style={{ margin: 0 }} className={c.kind === 'entity' ? 'am-mono' : undefined}>{c.label}</dd></React.Fragment>)}<dt style={{ color: 'var(--am-text-tertiary)' }}>Mode · cap</dt><dd style={{ margin: 0 }}>Flash · {run.used.cap?.amount.toFixed(2)} {run.used.cap?.unit}</dd><dt style={{ color: 'var(--am-text-tertiary)' }}>Sources</dt><dd style={{ margin: 0 }}>{run.used.sources.map(s => '[' + s + ']').join(' ')} · {utcStamp(run.used.snapshotAt)}</dd></dl></section>
        {unknown && <section role="alert" style={{ maxWidth: 760, padding: 16, border: '1px solid var(--am-warning-border)', borderRadius: 8, background: 'var(--am-warning-surface)' }}><b style={{ color: 'var(--am-warning-text)' }}>Connection lost · run status unknown</b><p style={{ margin: '8px 0', font: '400 14px/22px var(--am-font-ui)' }}>The server may have continued, completed or failed — this client cannot tell. Last confirmed snapshot is shown below. Check status by run ID <span className="am-mono">{run.runId}</span>; nothing is re-submitted and no new charge is created.</p><Button size="sm" onClick={load}>Check status</Button></section>}
        {!unknown && !isTerminal(run.status) && <section aria-label="Execution status" style={{ maxWidth: 760, padding: 16, border: '1px solid var(--am-info-border)', borderRadius: 8, background: 'var(--am-info-surface)' }}><b role="status" aria-live="polite" style={{ color: 'var(--am-info-text)' }}>{displayStatus(run.status, run.knowledge)}</b><span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-secondary)' }}> · time depends on data availability</span>{run.operations.map(o => <div key={o.id} style={{ display: 'flex', gap: 12, font: '400 14px/22px var(--am-font-ui)' }}><span style={{ width: 16 }}>{o.status === 'completed' ? '✓' : o.status === 'running' ? '●' : '○'}</span><span style={{ flex: 1 }}>{o.label} · source [{o.sourceRef}]</span><span style={{ color: 'var(--am-text-tertiary)' }}>{o.status}{o.at && ' ' + o.at}</span></div>)}<div style={{ marginTop: 8 }}><Button size="sm" onClick={async () => setRun(await getAdapter().cancelRun(run.runId))} loading={run.status === 'cancel_requested'} disabled={run.status === 'cancel_requested'}>{run.status === 'cancel_requested' ? 'Cancellation requested…' : 'Cancel run'}</Button> <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>Cancellation is a request; it is not confirmed until the run reports cancelled. Usage follows the ledger.</span></div></section>}
        {run.status === 'failed' && <section role="alert" style={{ maxWidth: 760, padding: 16, border: '1px solid var(--am-error-border)', borderRadius: 8, background: 'var(--am-error-surface)' }}><b style={{ color: 'var(--am-error-text)' }}>Research could not finish · no usable output</b><p style={{ margin: '8px 0', font: '400 14px/22px var(--am-font-ui)' }}>{run.operations.find(o => o.status === 'failed')?.label} failed ({run.operations.find(o => o.status === 'failed')?.reason}). Query, Used scope and your Next draft are kept. Usage per ledger: {run.usage?.amount} {run.usage?.unit}. Retry checks run status first and never duplicates the run.</p><div style={{ display: 'flex', gap: 8 }}><Button size="sm">Retry · review cost</Button><Button size="sm" variant="ghost">Edit question</Button></div></section>}
        {run.artifacts.map(a => <div key={a.artifactId} className="am-block-enter"><ResultBlock a={a} cite={cite} onPrepare={prepareFollowUp} /></div>)}
      </>}
      {!run && !res && <p role="status" style={{ color: 'var(--am-text-tertiary)' }}>Loading research…</p>}
    </div>
  </AppShell>;
}
