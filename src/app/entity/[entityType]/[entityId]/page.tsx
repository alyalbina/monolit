import { AppShell } from '@/ui/shell/AppShell';

export function generateStaticParams() {
  return [
    { entityType: 'token', entityId: 'jup' },
    { entityType: 'token', entityId: 'usdc' },
    { entityType: 'token', entityId: 'wif' },
  ];
}
export const dynamicParams = false;

export default function Page() {
  return <AppShell header={<span style={{ font: '700 14px/20px var(--am-font-ui)' }}>Entity</span>}>
    <div style={{ padding: 24, maxWidth: 760 }}><p style={{ color: 'var(--am-text-secondary)' }}>ENT-01 Entity Detail — implementation pending (design: HF 06b FR-006–009/043–046).</p></div>
  </AppShell>;
}
