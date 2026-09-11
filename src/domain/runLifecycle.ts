import type { RunStatus } from './types';
// Blueprint §06 / DOC-03: allowed backend transitions. status_unknown is client knowledge, handled in adapter reconciliation.
const NEXT: Record<RunStatus, RunStatus[]> = {
  draft: ['preflight'], preflight: ['accepted', 'draft'], accepted: ['queued', 'running', 'failed'], queued: ['running', 'cancel_requested', 'failed'],
  running: ['completed', 'partial', 'failed', 'cancel_requested'], cancel_requested: ['cancelled', 'completed', 'partial', 'failed'],
  completed: [], partial: [], failed: [], cancelled: [],
};
export const TERMINAL: ReadonlySet<RunStatus> = new Set(['completed', 'partial', 'failed', 'cancelled']);
export function canTransition(from: RunStatus, to: RunStatus): boolean { return NEXT[from].includes(to); }
export function isTerminal(s: RunStatus): boolean { return TERMINAL.has(s); }
/** Next Run allowed only when no active run in the research (one active Run per Research). */
export function nextRunAllowed(statuses: RunStatus[]): boolean { return statuses.every(isTerminal); }
/** Cancel requested ≠ cancelled. */
export function displayStatus(s: RunStatus, knowledge: 'known' | 'status_unknown'): string {
  if (knowledge === 'status_unknown') return 'Status unknown';
  return ({ draft: 'Draft', preflight: 'Checking scope', accepted: 'Accepted', queued: 'Queued', running: 'Running', completed: 'Completed', partial: 'Completed, partial', failed: 'Failed', cancel_requested: 'Cancel requested', cancelled: 'Cancelled' } as const)[s];
}
