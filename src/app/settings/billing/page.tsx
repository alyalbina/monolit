'use client';
import { AppShell } from '@/ui/shell/AppShell';
export default function Page() { return <AppShell header={<span style={{ font: '700 14px/20px var(--am-font-ui)' }}>Balance & Usage</span>}><div style={{ padding: 24, maxWidth: 760 }}><p style={{ color: 'var(--am-text-secondary)' }}>BIL-01 — implementation pending (design: HF 10b). Payments hidden while NEXT_PUBLIC_CAP_PAYMENTS=false (MI-04).</p></div></AppShell>; }
