'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import { getAdapter } from '@/adapters';
import { SearchOverlay } from './SearchOverlay';
/** Canonical shell GL-01..GL-07 (SA §03; Decision 02 width formula). Order: identity, New research, Search, Research, Market, Saved, (Watch hidden), Pinned, Recent, Collapse, Account/Balance. */
/** Layout effect on the client, plain effect during SSR: lets width-dependent presentation be
 *  decided before paint without tripping React's server-rendering warning. */
const useIsoLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;
type NavItem = { href: string; label: string; primary?: boolean };
const NAV: readonly NavItem[] = [{ href: '/research/new', label: 'New research', primary: true }, { href: '#search', label: 'Search' }, { href: '/research', label: 'Research' }, { href: '/market', label: 'Market' }, { href: '/saved', label: 'Saved' }];
export function AppShell({ children, header, inspector, footer }: { children: React.ReactNode; header: React.ReactNode; inspector?: React.ReactNode; footer?: React.ReactNode }) {
  const path = usePathname(); const [collapsed, setCollapsed] = React.useState(false); const [recent, setRecent] = React.useState<{ id: string; title: string; pinned: boolean }[]>([]);
  const [searchOpen, setSearchOpen] = React.useState(false);
  // Measured height of the docked composer, published to the route content as --am-dock-h.
  const footerRef = React.useRef<HTMLDivElement>(null);
  const [footerH, setFooterH] = React.useState(0);
  React.useEffect(() => {
    const el = footerRef.current;
    if (!el) { setFooterH(0); return; }
    const ro = new ResizeObserver(() => setFooterH(el.offsetHeight));
    ro.observe(el);
    setFooterH(el.offsetHeight);
    return () => ro.disconnect();
  }, [footer]);
  // Cmd/Ctrl+K opens OVR-01 from anywhere; Escape closes it without touching the draft underneath.
  React.useEffect(() => { const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  // Viewport width is read only after mount: reading `window` during render breaks SSR and desyncs hydration.
  // Until then we assume the desktop reference width (1440) so the server and first client paint agree.
  const [vw, setVw] = React.useState(1440);
  useIsoLayoutEffect(() => { const w = () => setVw(window.innerWidth); w(); window.addEventListener('resize', w); return () => window.removeEventListener('resize', w); }, []);
  React.useEffect(() => { getAdapter().listResearch().then(r => setRecent(r.map(x => ({ id: x.researchId, title: x.title, pinned: x.pinned })))).catch(() => setRecent([])); }, []);
  // Laptop and below present as a rail, but a user-chosen expanded sidebar is never auto-collapsed (Decision 02).
  const rail = collapsed || vw < 1280;
  // Width comes from CSS (correct on first paint); `collapsed` is the user's own preference and wins.
  const sidebarW = collapsed ? '64px' : 'var(--am-sidebar-w)';
  // Split allowed only if main >= 720 after inspector 336, margins 48, gutter 24 (Decision 02 formula).
  const splitOk = vw - (rail ? 64 : 232) - 336 - 48 - 24 >= 720;
  const pinned = recent.filter(r => r.pinned).slice(0, 3); const rec = recent.filter(r => !r.pinned).slice(0, 5);
  // /research/new is its own destination: opening it must not also light up the Research library.
  // The library owns /research, /research/templates and open sessions (/research/:id).
  const isActive = (href: string) => {
    if (href === '#search') return false;
    if (href === '/research/new') return path === '/research/new';
    if (href === '/research') return path === '/research' || (path.startsWith('/research/') && path !== '/research/new');
    return path === href || path.startsWith(href + '/');
  };
  return <div style={{ display: 'flex', minHeight: '100dvh' }}>
    <nav aria-label="Primary" style={{ width: sidebarW, flex: 'none', overflow: 'hidden', background: 'var(--am-bg-surface)', borderRight: '1px solid var(--am-border-subtle)', display: 'flex', flexDirection: 'column', padding: rail ? '12px 8px' : 12, gap: 8, position: 'sticky', top: 0, height: '100dvh', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 8px', font: '700 14px/20px var(--am-font-ui)' }}><span aria-hidden style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--am-text-primary)', color: 'var(--am-bg-surface)', display: 'grid', placeItems: 'center', font: '700 12px/16px var(--am-font-ui)' }}>M</span>{!rail && 'Ask.Monolit'}</div>
      {NAV.map(n => {
        const active = isActive(n.href);
        const look: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, height: rail ? 44 : n.primary ? 40 : 36, padding: rail ? '0 8px' : '0 10px', justifyContent: rail ? 'center' : 'flex-start', borderRadius: 8, textDecoration: 'none', font: '700 14px/20px var(--am-font-ui)', border: n.primary ? '1px solid var(--am-border-default)' : '1px solid transparent', background: active ? 'var(--am-int-selected)' : n.primary ? 'var(--am-int-secondary)' : 'transparent', color: active ? 'var(--am-int-selected-text)' : n.primary ? 'var(--am-text-primary)' : 'var(--am-text-secondary)', textAlign: 'left', width: '100%', boxSizing: 'border-box', cursor: 'pointer' };
        const inner = <>{rail ? <span className="am-sr">{n.label}</span> : n.label}{rail && <span aria-hidden>{n.label[0]}</span>}</>;
        // Search opens OVR-01 over the current workspace; it is not a route (SA §14).
        return n.href === '#search'
          ? <button key={n.href} type="button" onClick={() => setSearchOpen(true)} aria-haspopup="dialog" title={rail ? n.label : undefined} style={look}>{inner}</button>
          : <Link key={n.href} href={n.href as Route} aria-current={active ? 'page' : undefined} title={rail ? n.label : undefined} style={look}>{inner}</Link>;
      })}
      {!rail && (pinned.length + rec.length > 0) && <div style={{ flex: 1, minHeight: 0, overflow: 'auto', borderTop: '1px solid var(--am-border-subtle)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {pinned.length > 0 && <span style={{ padding: '4px 10px', font: '700 11px/16px var(--am-font-ui)', letterSpacing: .22, textTransform: 'uppercase', color: 'var(--am-text-tertiary)' }}>Pinned</span>}
        {pinned.map(r => <Link key={r.id} href={('/research/' + r.id) as Route} style={{ padding: '6px 10px', borderRadius: 8, font: '400 14px/20px var(--am-font-ui)', color: 'var(--am-text-primary)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</Link>)}
        {rec.length > 0 && <span style={{ padding: '12px 10px 4px', font: '700 11px/16px var(--am-font-ui)', letterSpacing: .22, textTransform: 'uppercase', color: 'var(--am-text-tertiary)' }}>Recent</span>}
        {rec.map(r => <Link key={r.id} href={('/research/' + r.id) as Route} aria-current={path.endsWith(r.id) ? 'page' : undefined} style={{ padding: '6px 10px', borderRadius: 8, font: '400 14px/20px var(--am-font-ui)', textDecoration: 'none', background: path.endsWith(r.id) ? 'var(--am-int-selected)' : 'transparent', color: path.endsWith(r.id) ? 'var(--am-int-selected-text)' : 'var(--am-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</Link>)}
      </div>}
      {rail && <div style={{ flex: 1 }} />}
      <button type="button" onClick={() => setCollapsed(c => !c)} aria-expanded={!rail} aria-label={rail ? 'Expand navigation' : 'Collapse navigation'} style={{ height: rail ? 44 : 36, border: 'none', background: 'transparent', color: 'var(--am-text-secondary)', font: '400 14px/20px var(--am-font-ui)', textAlign: 'left', padding: '0 10px' }}>{rail ? '›' : '‹ Collapse'}</button>
      <Link href="/settings/account" aria-label="Account and balance" style={{ display: 'flex', alignItems: 'center', gap: 8, height: 56, padding: '0 8px', borderTop: '1px solid var(--am-border-subtle)', textDecoration: 'none', color: 'inherit' }}><span aria-hidden style={{ width: 32, height: 32, borderRadius: 9999, background: 'var(--am-bg-active)', display: 'grid', placeItems: 'center', font: '700 12px/16px var(--am-font-ui)', color: 'var(--am-text-secondary)' }}>AK</span>{!rail && <span style={{ display: 'flex', flexDirection: 'column' }}><span style={{ font: '700 14px/20px var(--am-font-ui)' }}>Account</span><span style={{ font: '400 12px/18px var(--am-font-ui)', color: 'var(--am-text-tertiary)' }}>Balance</span></span>}</Link>
    </nav>
    <main id="main" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <header style={{ minHeight: 56, flex: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', borderBottom: '1px solid var(--am-border-subtle)', position: 'sticky', top: 0, background: 'var(--am-bg-canvas)', zIndex: 10, flexWrap: 'wrap' }}>
        {header}
        {getAdapter().mode === 'demo' && <div role="status" style={{ marginLeft: 'auto', flex: 'none', font: '700 11px/16px var(--am-font-ui)', padding: '2px 8px', borderRadius: 4, background: 'var(--am-warning-surface)', color: 'var(--am-warning-text)', border: '1px solid var(--am-warning-border)' }}>Demo mode · synthetic data</div>}
      </header>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* SA §05: the docked composer must never cover the last row, citation or focused field, and
              the reserved space depends on its real height — which grows with the context tray and with
              wrapping at narrow widths. So the height is measured, not guessed. */}
          <div style={{ flex: 1, minWidth: 0, ['--am-dock-h' as string]: footerH + 'px' }}>{children}</div>
          {footer && <div ref={footerRef} style={{ position: 'sticky', bottom: 0, background: 'var(--am-bg-canvas)', borderTop: '1px solid var(--am-border-subtle)', padding: '12px 24px 16px' }}>{footer}</div>}
        </div>
        {inspector && splitOk && <aside aria-label="Inspector" style={{ width: 336, flex: 'none', borderLeft: '1px solid var(--am-border-subtle)', background: 'var(--am-bg-surface)', position: 'sticky', top: 56, height: 'calc(100dvh - 56px)', overflow: 'auto' }}>{inspector}</aside>}
        {inspector && !splitOk && <div role="dialog" aria-modal="true" aria-label="Inspector" style={{ position: 'fixed', inset: 0, background: 'var(--am-scrim)', zIndex: 40, display: 'flex', justifyContent: 'flex-end' }}><aside style={{ width: 336, maxWidth: '100vw', background: 'var(--am-bg-overlay)', boxShadow: 'var(--am-e3)', overflow: 'auto' }}>{inspector}</aside></div>}
      </div>
    </main>
    <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
  </div>;
}
