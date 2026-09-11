'use client';
import * as React from 'react';
import type { Draft } from '@/domain/types';
import type { Quote } from '@/adapters/types';
import { getAdapter } from '@/adapters';
/** Draft ownership + quote invalidation (Blueprint §06 / DOC-02 / DOC-03). Save is debounced; failure keeps edits and reports save_failed. Quote is tied to draft.revision. */
export function useDraft(initial: Draft) {
  const [draft, setDraft] = React.useState<Draft>(initial);
  const [quote, setQuote] = React.useState<Quote | null>(null);
  const [saving, setSaving] = React.useState<'idle' | 'saving' | 'saved' | 'save_failed'>('idle');

  // `revision` is the single change signal for the draft: any edit to query, context, window or mode
  // bumps it. Keying the debounce on the draft object instead would restart the timer on every
  // re-render, and re-running the save on an unchanged draft would defeat the debounce.
  const revision = draft.revision;
  const latest = React.useRef(draft);
  latest.current = draft;

  React.useEffect(() => {
    setQuote(null); // any edit invalidates the accepted scope/cost review (Blueprint §06)
    if (revision === 0) return;
    const t = setTimeout(async () => {
      setSaving('saving');
      const r = await getAdapter().saveDraft(latest.current);
      // On failure the user's edits stay on screen; only the acknowledgement differs (DOC-02).
      setSaving(r.savedState === 'save_failed' ? 'save_failed' : 'saved');
    }, 600);
    return () => clearTimeout(t);
  }, [revision]);

  const preflight = React.useCallback(async () => {
    const d = latest.current;
    const q = await getAdapter().preflight(d);
    // Discard a quote that arrived after the draft moved on — it priced a scope that no longer exists.
    if (q.revision === latest.current.revision) setQuote(q);
    return q;
  }, []);

  React.useEffect(() => {
    const d = latest.current;
    if (!d.query.trim() && !d.context.length) return;
    const t = setTimeout(preflight, 400);
    return () => clearTimeout(t);
  }, [revision, preflight]);

  return { draft, setDraft, quote, saving, preflight };
}
