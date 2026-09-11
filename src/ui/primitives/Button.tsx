'use client';
import * as React from 'react';
type Variant = 'primary' | 'secondary' | 'ghost'; type Size = 'sm' | 'md' | 'lg';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; loading?: boolean; icon?: React.ReactNode }
const H: Record<Size, number> = { sm: 32, md: 40, lg: 48 };
/** Core/Button (Motion spec §10.1). Pending reserves the icon slot so the button keeps its width,
 *  blocks repeat activation, and — unlike `disabled` — stays focusable, because a disabled control
 *  drops focus to <body> and strands a keyboard user mid-flow. `disabled` is kept for genuine
 *  unavailability only (§11.1, §25.2). */
export function Button({ variant = 'secondary', size = 'md', loading, icon, children, disabled, style, onClick, ...rest }: ButtonProps) {
  const inert = disabled || loading;
  const bg = variant === 'primary' ? 'var(--am-int-primary)' : variant === 'secondary' ? 'var(--am-int-secondary)' : 'transparent';
  const color = inert ? 'var(--am-text-disabled)' : variant === 'primary' ? 'var(--am-text-on-primary)' : variant === 'ghost' ? 'var(--am-text-secondary)' : 'var(--am-text-primary)';
  return <button
    type="button"
    className="am-btn"
    aria-busy={loading || undefined}
    aria-disabled={inert || undefined}
    disabled={disabled && !loading}
    onClick={loading ? undefined : onClick}
    {...rest}
    style={{ height: H[size], padding: '0 ' + (size === 'sm' ? 12 : 16) + 'px', borderRadius: 8, border: variant === 'secondary' ? '1px solid var(--am-border-default)' : '1px solid transparent', background: inert ? 'var(--am-int-disabled)' : bg, color, font: '700 ' + (size === 'lg' ? '16px/24px' : '14px/20px') + ' var(--am-font-ui)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: inert ? 'default' : 'pointer', ...style }}
  >
    {/* Reserved icon slot: present in both states so the label cannot shift when pending begins. */}
    {(loading || icon) && <span aria-hidden className={loading ? 'am-spin' : undefined} style={{ width: 14, height: 14, flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: loading ? '2px solid currentColor' : undefined, borderTopColor: loading ? 'transparent' : undefined, borderRadius: loading ? 9999 : undefined }}>{loading ? null : icon}</span>}
    {children}
  </button>;
}
