'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import * as F from '@/adapters/demo/fixture';

type Result = { kind: 'wallet' | 'token' | 'research'; identity: string; sub: string; href: string };
type State = 'recent' | 'typing' | 'results' | 'no_results' | 'invalid' | 'unavailable';

const RECENT: Result[] = [
  { kind: 'wallet', identity: F.WALLET.short, sub: 'Wallet · Solana', href: '/wallet/solana/' + F.WALLET.full },
  { kind: 'research', identity: F.RESEARCH.title, sub: 'Research · ' + F.RESEARCH.id, href: '/research/' + F.RESEARCH.id },
];

/** A base58 Solana address is 32–44 chars from the base58 alphabet (no 0, O, I, l). */
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function search(q: string): { state: State; results: Result[]; message?: string } {
  const term = q.trim();
  if (!term) return { state: 'recent', results: RECENT };
  // A long unbroken token is an identifier attempt: judge it as an address, not as free text.
  if (/^\S{20,}$/.test(term)) {
    if (!BASE58.test(term)) return { state: 'invalid', results: [], message: 'Not a supported identifier. Solana addresses are 32–44 base58 characters (no 0, O, I or l). Chain is never guessed for you.' };
    const known = term === F.WALLET.full;
    return { state: 'results', results: [{ kind: 'wallet', identity: known ? F.WALLET.short : term.slice(0, 4) + '…' + term.slice(-4), sub: 'Wallet · Solana' + (known ? '' : ' · not seen in this fixture'), href: '/wallet/solana/' + term }] };
  }
  const hay = [
    ...RECENT,
    { kind: 'token' as const, identity: 'JUP', sub: 'Token · Solana', href: '/entity/token/jup' },
    { kind: 'token' as const, identity: 'USDC', sub: 'Token · Solana', href: '/entity/token/usdc' },
    { kind: 'token' as const, identity: 'WIF', sub: 'Token · Solana', href: '/entity/token/wif' },
  ];
  const hits = hay.filter(r => (r.identity + ' ' + r.sub).toLowerCase().includes(term.toLowerCase()));
  return hits.length ? { state: 'results', results: hits } : { state: 'no_results', results: [], message: 'No match in the demo index for “' + term + '”. The scope searched is the synthetic fixture — this is a checked absence, not a source failure.' };
}

/** OVR-01 Search / command. Opening a result navigates; it never starts a research run (SA §14).
 *  Close returns to the workspace and its draft untouched. */
export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = React.useState('');
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { state, results, message } = React.useMemo(() => search(q), [q]);

  React.useEffect(() => { if (open) { setQ(''); setActive(0); requestAnimationFrame(() => inputRef.current?.focus()); } }, [open]);
  React.useEffect(() => { setActive(0); }, [q]);

  if (!open) return null;

  const go = (r: Result) => { onClose(); router.push(r.href as Route); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
    if (!results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => (i + 1) % results.length); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => (i - 1 + results.length) % results.length); }
    // Enter opens the selected result. It never runs a research (SA §14 / DOC-04).
    if (e.key === 'Enter') { e.preventDefault(); go(results[active]); }
  };

  return <div role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, background: 'var(--am-scrim)', zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '10vh' }}>
    <div role="dialog" aria-modal="true" aria-label="Search" className="am-overlay-enter" onKeyDown={onKey} style={{ width: 640, maxWidth: 'calc(100vw - 32px)', background: 'var(--am-bg-overlay)', border: '1px solid var(--am-border-subtle)', borderRadius: 12, boxShadow: 'var(--am-e3)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', borderBottom: '1px solid var(--am-border-subtle)' }}>
        <span aria-hidden style={{ color: 'var(--am-text-tertiary)' }}>⌕</span>
        <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} aria-label="Search wallets, tokens and research"
          aria-describedby="search-hint" placeholder="Search wallets, tokens, research — or paste an address"
          style={{ flex: 1, height: 56, border: 'none', outline: 'none', background: 'transparent', color: 'inherit', font: '400 16px/26px var(--am-font-ui)' }} />
        <button type="button" onClick={onClose} aria-label="Close search" style={{ width: 32, height: 32, border: '1px solid var(--am-border-subtle)', borderRadius: 8, background: 'transparent', color: 'var(--am-text-secondary)', cursor: 'pointer' }}>×</button>
      </div>

      {state === 'recent' && <div style={{ padding: '8px 0' }}><p style={{ margin: 0, padding: '4px 16px', font: '700 11px/16px var(--am-font-ui)', letterSpacing: .22, textTransform: 'uppercase', color: 'var(--am-text-tertiary)' }}>Recent</p></div>}

      {(state === 'recent' || state === 'results') && <ul role="listbox" aria-label="Search results" style={{ listStyle: 'none', margin: 0, padding: '0 0 8px', maxHeight: 320, overflow: 'auto' }}>
        {results.map((r, i) => <li key={r.href} role="option" aria-selected={i === active}>
          <button type="button" className="am-row" onMouseEnter={() => setActive(i)} onClick={() => go(r)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', minHeight: 44, padding: '8px 16px', border: 'none', textAlign: 'left', cursor: 'pointer', background: i === active ? 'var(--am-int-selected)' : 'transparent', color: i === active ? 'var(--am-int-selected-text)' : 'inherit' }}>
            <span style={{ font: '700 11px/16px var(--am-font-ui)', textTransform: 'uppercase', letterSpacing: .22, color: 'var(--am-text-tertiary)', width: 64 }}>{r.kind}</span>
            <span className={r.kind === 'wallet' ? 'am-mono' : undefined} style={{ flex: 1 }}>{r.identity}</span>
            <span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>{r.sub}</span>
          </button>
        </li>)}
      </ul>}

      {(state === 'no_results' || state === 'invalid' || state === 'unavailable') && <p role="status" style={{ margin: 0, padding: '16px', font: '400 14px/22px var(--am-font-ui)', color: state === 'invalid' ? 'var(--am-error-text)' : 'var(--am-text-secondary)', background: state === 'invalid' ? 'var(--am-error-surface)' : 'transparent' }}>{message}</p>}

      <p id="search-hint" style={{ margin: 0, padding: '8px 16px', borderTop: '1px solid var(--am-border-subtle)', font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>
        ↑↓ to select · Enter opens the result · Esc closes. Opening a result does not start a research run.
      </p>
    </div>
  </div>;
}
