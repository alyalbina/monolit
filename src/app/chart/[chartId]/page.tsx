import { AppShell } from '@/ui/shell/AppShell';

export function generateStaticParams() {
  return [{ chartId: 'art_0142' }];
}
export const dynamicParams = false;

export default function Page() {
  return <AppShell header={<span style={{ font: '700 14px/20px var(--am-font-ui)' }}>Chart</span>}>
    <div style={{ padding: 24, maxWidth: 760 }}><p style={{ color: 'var(--am-text-secondary)' }}>DAT-01 Chart Detail — implementation pending (design: HF 08b FR-012/049).</p></div>
  </AppShell>;
}
