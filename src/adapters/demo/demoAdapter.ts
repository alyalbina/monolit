import type { DataAdapter, Quote, Scenario } from '../types';
import type { Balance, Capabilities, Draft, PaymentAttempt, Research, Run, SavedReference, SourceSnapshot, ChartArtifact, UsageRecord, ResultArtifact } from '@/domain/types';
import * as F from './fixture';
import { capabilityFlags } from '../capabilities';

const SCENARIOS = ['completed', 'partial', 'terminal_error', 'status_unknown', 'invalid_context', 'no_results', 'stale', 'insufficient_balance', 'payment_pending', 'save_failure'] as const;
/** Deterministic Demo adapter. Scenario is selected via ?demo=<scenario> (DOC-05) so every state is reproducible for QA and VR. Demo mode is announced in the shell. */
export class DemoAdapter implements DataAdapter {
  readonly mode = 'demo' as const;
  private research = new Map<string, Research>();
  private runs = new Map<string, Run>();
  private drafts = new Map<string, Draft>();
  private scenario: Scenario = 'completed';
  private saveFailures = 0;
  isScenario(s: string): s is Scenario { return (SCENARIOS as readonly string[]).includes(s); }
  /** Switching scenario drops the seeded fixtures so the next read rebuilds them for the new state. */
  setScenario(s: Scenario) { if (s === this.scenario) return; this.scenario = s; this.research.clear(); this.runs.clear(); this.drafts.clear(); this.saveFailures = 0; }
  private delay(ms = 120) { return new Promise(r => setTimeout(r, ms)); }
  async capabilities(): Promise<Capabilities> { return capabilityFlags(); }
  private used() { return { items: [{ kind: 'entity' as const, entity: { type: 'wallet' as const, chain: 'solana' as const, id: F.WALLET.full, display: F.WALLET.short }, label: 'Wallet ' + F.WALLET.short + ' · Solana', status: 'valid' as const }, { kind: 'window' as const, window: { startUtc: '2026-09-04T00:00:00Z', endUtc: '2026-09-11T00:00:00Z', tz: 'UTC' as const, label: F.WINDOW.label }, label: F.WINDOW.label }], mode: 'flash' as const, cap: { amount: 2, unit: 'credits (demo unit)' }, sources: ['1', '2', '3'], snapshotAt: '2026-09-11T06:40:00Z' }; }
  private artifacts(partial: boolean): ResultArtifact[] {
    const table = { columns: ['From wallet', 'Label', 'Amount (USDC)', 'Transfers', 'First (UTC)', 'Last (UTC)', 'Evidence'], rows: F.FUNDERS.map(r => ({ from: r.from, full: r.full, label: r.label, amount: r.amount, n: r.n, first: r.first, last: r.last, ref: r.ref, unavailable: r.amount === null })) };
    const base: ResultArtifact[] = [
      { artifactId: 'rb01', version: 1, type: 'RB-01', anchor: 'answer', title: 'Answer', payload: { text: 'Between 4 and 10 Sep 2026 (UTC), ' + F.WALLET.short + ' received ' + F.RESEARCH.total + ' USDC in 25 amount-resolved incoming transfers from 9 distinct wallets. Two further transfers from Ct2n…Gy6Q have unresolved amounts.' + (partial ? ' Upstream (depth-2) funders could not be resolved in this run.' : ' One depth-2 upstream wallet, Kp8w…Yd2S, sits behind the largest direct funder.'), caveat: partial ? 'The question asked for the upstream graph; only the direct (depth-1) layer is available. Absence of depth-2 edges means no coverage, not no activity.' : 'Observed transfers show the direct funding path only; they do not establish control. Depth-2 edges come from a snapshot ending 10 Sep 22:15 UTC [2] stale.' }, claims: [{ claimId: 'c1', text: 'received ' + F.RESEARCH.total + ' USDC in 25 transfers from 9 wallets', citations: [{ sourceRef: '1', recordIds: ['r1', 'r2', 'r3', 'r4', 'r5'], state: 'available' }], material: true }, { claimId: 'c2', text: 'two transfers from Ct2n…Gy6Q unresolved', citations: [{ sourceRef: '2', recordIds: [], state: partial ? 'unavailable' : 'stale' }] }], sourceRefs: ['1', '2'] },
      { artifactId: 'rb02', version: 1, type: 'RB-02', anchor: 'finding-top3', title: 'Three counterparties supplied 74.2% of observed inflow', payload: { text: '3xVt…9Qe1, Dq7m…Lp4W and HnR2…Zc8f account for ' + F.RESEARCH.top3 + ' USDC of ' + F.RESEARCH.total + ' USDC across 10 transfers. Interpretation: inflow is concentrated, not broad. Transfers are not a buy/sell classification.' }, claims: [{ claimId: 'c3', text: 'top 3 = 74.2%', citations: [{ sourceRef: '1', recordIds: ['r1', 'r3', 'r5'], state: 'available' }] }], sourceRefs: ['1'] },
      { artifactId: 'art_0142', version: 1, type: 'RB-06', anchor: 'chart-daily', title: 'Daily observed USDC inflow to ' + F.WALLET.short, payload: { unit: 'USDC', xLabel: 'day (UTC)', points: F.DAILY.map(d => ({ x: d.day, y: Number(d.v.replace(/,/g, '')) })), note: 'resolved amounts only (25 of 27)' }, claims: [], sourceRefs: ['1'] },
      { artifactId: 'rb05', version: 1, type: 'RB-05', anchor: 'table-depth1', title: 'Direct incoming USDC transfers · depth 1', payload: table, claims: [], sourceRefs: ['1', '3'] },
      { artifactId: 'rb07', version: 1, type: 'RB-07', anchor: 'method', title: 'Method, coverage and sources', payload: { sources: F.SOURCES }, claims: [], sourceRefs: ['1', '2', '3'] },
      { artifactId: 'rb11', version: 1, type: 'RB-11', anchor: 'follow-ups', title: 'Suggested follow-ups', payload: { items: F.FOLLOWUPS }, claims: [], sourceRefs: [] },
    ];
    if (partial) base.splice(0, 0, { artifactId: 'rb12', version: 1, type: 'RB-12', anchor: 'recovery', title: 'Partial result · 1 of 4 operations did not complete', payload: { source: '2', reason: 'Demo upstream hop index did not respond (timeout 06:43:50 UTC)', affected: ['depth-2 upstream edges', 'amounts of 2 transfers from Ct2n…Gy6Q'], unaffected: ['direct incoming transfers [1]', 'address labels [3]'] }, claims: [], sourceRefs: ['2'] });
    else base.splice(3, 0, { artifactId: 'rb09', version: 1, type: 'RB-09', anchor: 'network', title: 'Observed upstream relationships · depth 2', payload: { edges: F.EDGES2, note: 'Depth-2 amounts are not added to direct inflow. No ownership inference.' }, claims: [], sourceRefs: ['1', '2'] });
    return base;
  }
  private seed() {
    if (this.research.size) return;
    const used = this.used();
    const ops = (s: Scenario): Run['operations'] => {
      const done = (id: string, label: string, ref: string, at: string) => ({ id, label, sourceRef: ref, status: 'completed' as const, at });
      if (s === 'terminal_error') return [{ id: 'op1', label: 'Load direct incoming transfers', sourceRef: '1', status: 'failed', at: '06:42:10', reason: 'ref. c7e2-4b19' }];
      return [done('op1', 'Load direct incoming transfers', '1', '06:41:40'), s === 'partial' ? { id: 'op2', label: 'Resolve upstream hops, depth 2', sourceRef: '2', status: 'unavailable', at: '06:43:50', reason: 'did not respond (timeout)' } : done('op2', 'Resolve upstream hops, depth 2', '2', '06:43:21'), done('op3', 'Look up address labels', '3', '06:43:30'), done('op4', 'Build answer and findings', '-', '06:44:02')];
    };
    const s = this.scenario;
    const status: Run['status'] = s === 'partial' ? 'partial' : s === 'terminal_error' ? 'failed' : s === 'status_unknown' ? 'running' : 'completed';
    const run: Run = { runId: 'run_01', researchId: 'RS-2409', status, knowledge: s === 'status_unknown' ? 'status_unknown' : 'known', used, query: F.RESEARCH.query, acceptedAt: '2026-09-11T06:41:12Z', completedAt: status === 'completed' || status === 'partial' ? '2026-09-11T06:44:02Z' : undefined, idempotencyKey: 'idem_run_01', operations: ops(s), usage: s === 'terminal_error' ? { amount: 0.2, unit: 'credits (demo unit)', settled: true } : { amount: s === 'partial' ? 1.1 : 1.4, unit: 'credits (demo unit)', settled: true }, artifacts: s === 'terminal_error' ? [] : s === 'status_unknown' ? this.artifacts(false).filter(a => a.type === 'RB-05') : this.artifacts(s === 'partial') };
    this.runs.set(run.runId, run);
    const draft: Draft = { draftId: 'd_next', researchId: 'RS-2409', query: 'Where did this wallet send USDC in the same window?', context: used.items.slice(), mode: 'flash', parentRunId: 'run_01', revision: 1, savedState: s === 'status_unknown' ? 'local_only' : 'saved', savedAt: '2026-09-11T06:45:00Z' };
    this.drafts.set(draft.draftId, draft);
    this.research.set('RS-2409', { researchId: 'RS-2409', owner: 'demo', title: F.RESEARCH.title, createdAt: '2026-09-11T06:39:00Z', updatedAt: '2026-09-11T06:44:02Z', pinned: false, drafts: [draft], runs: [run], saveState: draft.savedState });
  }
  async listResearch() { this.seed(); await this.delay(); return [...this.research.values()]; }
  async getResearch(id: string) { this.seed(); await this.delay(); return this.research.get(id) ?? null; }
  async saveDraft(d: Draft): Promise<Draft> {
    await this.delay(200);
    if (this.scenario === 'save_failure' && this.saveFailures++ < 1) return { ...d, savedState: 'save_failed' }; // edits are kept by caller
    const saved = { ...d, savedState: 'saved' as const, savedAt: new Date().toISOString() }; this.drafts.set(d.draftId, saved); return saved;
  }
  async preflight(d: Draft): Promise<Quote> {
    await this.delay(300);
    const wallet = d.context.find(c => c.kind === 'entity' && c.entity?.type === 'wallet');
    if (this.scenario === 'invalid_context' || d.context.some(c => c.status === 'invalid')) return { ok: false, capAmount: 0, unit: 'credits (demo unit)', reason: 'A required parameter is invalid: address does not match the selected chain.', revision: d.revision };
    if (!d.query.trim() && !wallet) return { ok: false, capAmount: 0, unit: 'credits (demo unit)', reason: 'Enter a question or add a wallet.', revision: d.revision };
    if (this.scenario === 'insufficient_balance') return { ok: false, capAmount: 60, unit: 'credits (demo unit)', reason: 'Available credit 48.20 is below the required cap 60.00.', revision: d.revision };
    return { ok: true, capAmount: 2, unit: 'credits (demo unit)', revision: d.revision };
  }
  async submitRun(d: Draft, idempotencyKey: string, quoteRevision: number): Promise<Run> {
    this.seed(); await this.delay(400);
    const existing = [...this.runs.values()].find(r => r.idempotencyKey === idempotencyKey); if (existing) return existing; // DOC-03 idempotency
    if (quoteRevision !== d.revision) throw new Error('Quote invalidated by draft change — review scope again');
    if ([...this.runs.values()].some(r => r.researchId === (d.researchId ?? 'RS-2409') && !['completed', 'partial', 'failed', 'cancelled'].includes(r.status))) throw new Error('A run is already active in this research');
    const run: Run = { runId: 'run_' + (this.runs.size + 1).toString().padStart(2, '0'), researchId: d.researchId ?? 'RS-2409', status: 'accepted', knowledge: 'known', used: { ...this.used(), items: d.context.map(c => ({ ...c })), mode: d.mode }, query: d.query, parentRunId: d.parentRunId, acceptedAt: new Date().toISOString(), idempotencyKey, operations: [], artifacts: [] };
    this.runs.set(run.runId, run);
    const stages: Run['status'][] = ['queued', 'running', this.scenario === 'partial' ? 'partial' : this.scenario === 'terminal_error' ? 'failed' : 'completed'];
    stages.forEach((st, i) => setTimeout(() => { const r = this.runs.get(run.runId)!; if (r.status === 'cancel_requested' && i === 2) { this.runs.set(run.runId, { ...r, status: 'cancelled' }); return; } this.runs.set(run.runId, { ...r, status: st, completedAt: i === 2 ? new Date().toISOString() : undefined, artifacts: i >= 1 ? this.artifacts(this.scenario === 'partial').slice(0, i === 1 ? 1 : undefined) : [], operations: i === 2 ? (this.scenario === 'partial' ? [] : []) : r.operations }); }, 1500 * (i + 1)));
    return run;
  }
  async getRun(runId: string) { this.seed(); await this.delay(); if (this.scenario === 'status_unknown') throw new Error('network'); return this.runs.get(runId) ?? null; }
  async cancelRun(runId: string): Promise<Run> { await this.delay(); const r = this.runs.get(runId)!; const c = { ...r, status: 'cancel_requested' as const }; this.runs.set(runId, c); return c; }
  async getSource(ref: string): Promise<SourceSnapshot | null> {
    await this.delay(); const s = F.SOURCES.find(x => String(x.n) === ref); if (!s) return null;
    const unavailable = this.scenario === 'partial' && ref === '2';
    return { sourceRef: ref, name: s.name, snapshotAt: s.time, retrievedAt: '2026-09-11T06:41:40Z', freshness: unavailable ? 'unknown' : s.fresh === 'Stale' ? 'stale' : 'fresh', coverage: unavailable ? 'Unknown for this run — not zero' : s.coverage, state: unavailable ? 'unavailable' : (s.state as SourceSnapshot['state']) };
  }
  async getChart(id: string): Promise<ChartArtifact | null> { await this.delay(); if (id !== 'art_0142') return null; return { artifactId: id, version: 1, researchId: 'RS-2409', runId: 'run_01', title: 'Daily observed USDC inflow to ' + F.WALLET.short, metric: 'sum of resolved SPL USDC transfers per UTC day', timeframe: { startUtc: '2026-09-04T00:00:00Z', endUtc: '2026-09-11T00:00:00Z', tz: 'UTC', label: F.WINDOW.label }, series: [{ name: 'Observed inflow', points: F.DAILY.map(d => ({ x: d.day, y: this.scenario === 'no_results' ? null : Number(d.v.replace(/,/g, '')) })) }], unit: 'USDC', sourceRef: '1' }; }
  async listSaved(): Promise<SavedReference[]> { await this.delay(); return [{ id: 's1', kind: 'entity', target: 'wallet:solana:' + F.WALLET.full, origin: 'RS-2409 · Run 1', savedAt: '2026-09-11T06:52:00Z', available: true }, { id: 's2', kind: 'chart', target: 'art_0142', origin: 'RS-2409 · Run 1', version: 'v1', savedAt: '2026-09-11T06:46:00Z', available: true }, { id: 's3', kind: 'template', target: 'TMP-06', origin: 'catalog', version: 'v1', savedAt: '2026-09-02T08:31:00Z', available: false, reason: 'source not configured' }]; }
  async balance(): Promise<Balance> { await this.delay(); return { available: this.scenario === 'insufficient_balance' ? 48.2 : 48.2, reserved: 0, pending: this.scenario === 'payment_pending' ? 20 : 0, unit: 'credits (demo unit)', asOf: '2026-09-11T07:20:00Z' }; }
  async usage(): Promise<UsageRecord[]> { await this.delay(); return [{ at: '2026-09-11T06:44:00Z', runId: 'run_01', amount: 1.4, unit: 'credits (demo unit)', status: 'settled' }]; }
  async payments(): Promise<PaymentAttempt[]> { await this.delay(); return [{ ref: 'pay_9f21…a3c0', amount: 20, unit: 'credits (demo unit)', startedAt: '2026-09-11T07:20:00Z', status: this.scenario === 'payment_pending' ? 'pending' : 'settled' }]; }
  async verifyPayment(ref: string): Promise<PaymentAttempt> { await this.delay(500); const p = (await this.payments()).find(x => x.ref === ref)!; return p; /* stays pending in demo until scenario changes — never inferred from URL */ }
}
