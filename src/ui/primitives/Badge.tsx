import * as React from 'react';
export type Tone = 'neutral' | 'success' | 'warning' | 'error' | 'info';
export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  const map: Record<Tone, [string, string]> = { neutral: ['var(--am-bg-hover)', 'var(--am-text-secondary)'], success: ['var(--am-success-surface)', 'var(--am-success-text)'], warning: ['var(--am-warning-surface)', 'var(--am-warning-text)'], error: ['var(--am-error-surface)', 'var(--am-error-text)'], info: ['var(--am-info-surface)', 'var(--am-info-text)'] };
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: '700 12px/18px var(--am-font-ui)', padding: '2px 8px', borderRadius: 4, background: map[tone][0], color: map[tone][1] }}>{children}</span>;
}
