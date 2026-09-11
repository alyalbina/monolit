import type { Balance, Capabilities, Draft, PaymentAttempt, Research, Run, SavedReference, SourceSnapshot, ChartArtifact, UsageRecord } from '@/domain/types';
export type Scenario = 'completed' | 'partial' | 'terminal_error' | 'status_unknown' | 'invalid_context' | 'no_results' | 'stale' | 'insufficient_balance' | 'payment_pending' | 'save_failure';
export interface Quote { ok: boolean; capAmount: number; unit: string; reason?: string; revision: number }
export interface DataAdapter {
  readonly mode: 'demo' | 'real';
  capabilities(): Promise<Capabilities>;
  listResearch(): Promise<Research[]>;
  getResearch(id: string): Promise<Research | null>;
  saveDraft(d: Draft): Promise<Draft>;                       // DOC-02: returns server-acknowledged state
  preflight(d: Draft): Promise<Quote>;                         // invalidated by any draft revision change
  submitRun(d: Draft, idempotencyKey: string, quoteRevision: number): Promise<Run>; // DOC-03: idempotent
  getRun(runId: string): Promise<Run | null>;                  // reconciliation by runId
  cancelRun(runId: string): Promise<Run>;                      // returns cancel_requested, not cancelled
  getSource(sourceRef: string): Promise<SourceSnapshot | null>;
  getChart(artifactId: string): Promise<ChartArtifact | null>;
  listSaved(): Promise<SavedReference[]>;
  balance(): Promise<Balance>;
  usage(): Promise<UsageRecord[]>;
  payments(): Promise<PaymentAttempt[]>;
  verifyPayment(ref: string): Promise<PaymentAttempt>;         // DOC-06: return URL is never proof
}
