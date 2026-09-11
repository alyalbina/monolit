import type { ContextItem } from '@/domain/types';

/** Context Carry (Blueprint §13 Data → AI). Investigate / Ask hand a prepared draft to RES-01: the
 *  canonical entity, the exact window and where it came from travel with it, so nothing has to be
 *  copy-pasted and no scope is silently re-derived.
 *
 *  It is a handover, not an execution: the receiving screen fills the composer and stops. Running
 *  still requires an explicit Run after preflight. sessionStorage is used because the payload belongs
 *  to this navigation only — it must not survive as a second, competing source of draft state. */
const KEY = 'am.preparedDraft';

export interface PreparedDraft {
  query: string;
  context: ContextItem[];
  /** Human-readable provenance shown next to the composer, e.g. "Wallet 8f3K…2Ac9 · Solana". */
  originLabel: string;
  /** Route to return to when the user backs out of the prepared draft. */
  originHref: string;
}

export function putPreparedDraft(d: PreparedDraft): void {
  try { sessionStorage.setItem(KEY, JSON.stringify(d)); } catch { /* private mode: the draft simply is not carried */ }
}

/** Reads and clears in one step: a carried draft is consumed once, so a later reload of RES-01
 *  shows a genuinely empty composer rather than resurrecting a stale hand-over. */
export function takePreparedDraft(): PreparedDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    return JSON.parse(raw) as PreparedDraft;
  } catch {
    return null;
  }
}
