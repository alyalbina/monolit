'use client';
import * as React from 'react';
/** Modal/Dialog: native <dialog>, focus trap via showModal, Escape closes, focus returns to trigger (DOC-04). */
export function Dialog({ open, onClose, title, children, width = 560 }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: number }) {
  const ref = React.useRef<HTMLDialogElement>(null);
  React.useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close(); }, [open]);
  return <dialog ref={ref} onClose={onClose} aria-labelledby="dlg-title" style={{ width, maxWidth: 'calc(100vw - 32px)', border: '1px solid var(--am-border-subtle)', borderRadius: 12, padding: 0, background: 'var(--am-bg-overlay)', color: 'var(--am-text-primary)', boxShadow: 'var(--am-e3)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 16px 8px' }}><h2 id="dlg-title" style={{ margin: 0, font: '700 18px/26px var(--am-font-ui)' }}>{title}</h2><button type="button" aria-label="Close" onClick={onClose} style={{ marginLeft: 'auto', width: 32, height: 32, border: '1px solid var(--am-border-subtle)', borderRadius: 8, background: 'transparent', color: 'var(--am-text-secondary)' }}>×</button></div>
    <div style={{ padding: '0 16px 16px' }}>{children}</div>
  </dialog>;
}
