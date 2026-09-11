'use client';
import { useParams } from 'next/navigation';
import { AppShell } from '@/ui/shell/AppShell';

export function WalletView() {
  const { chainId, address } = useParams<{ chainId: string; address: string }>();
  return <AppShell header={<span style={{ font: '700 14px/20px var(--am-font-ui)' }}>Wallet</span>}>
    <div style={{ padding: 24, maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p className="am-mono" style={{ margin: 0 }}>{address}</p>
      <p style={{ margin: 0, color: 'var(--am-text-tertiary)', font: '400 12px/18px var(--am-font-ui)' }}>Chain · {chainId}</p>
      <p style={{ color: 'var(--am-text-secondary)' }}>WAL-01 Wallet Detail — implementation pending (design: HF 05, 04b, 09 FR-005/027/036/037/042).</p>
    </div>
  </AppShell>;
}
