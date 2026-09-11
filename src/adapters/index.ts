import type { DataAdapter } from './types';
import { DemoAdapter } from './demo/demoAdapter';
import { RealAdapter } from './real/realAdapter';
export { capabilityFlags } from './capabilities';
let instance: DataAdapter | null = null;
export function getAdapter(): DataAdapter {
  if (instance) return instance;
  const mode = process.env.NEXT_PUBLIC_DATA_ADAPTER === 'real' ? 'real' : 'demo';
  instance = mode === 'real' ? new RealAdapter(process.env.NEXT_PUBLIC_API_BASE ?? '') : new DemoAdapter();
  return instance;
}
/** Demo-only: apply the ?demo=<scenario> switch (DOC-05) so every QA/VR state is reproducible.
 *  No-op on the real adapter — scenarios are a fixture concept, never a production control. */
export function applyDemoScenario(raw: string | null): void {
  if (!raw) return;
  const a = getAdapter();
  if (a instanceof DemoAdapter && a.isScenario(raw)) a.setScenario(raw);
}
