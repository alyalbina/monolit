import type { Capabilities } from '@/domain/types';
/** Capability flags (DOC-05). Kept in its own module so adapters can read them without importing
 *  the adapter registry, which would create an import cycle (index → DemoAdapter → index). */
export const capabilityFlags = (): Capabilities => ({
  compare: process.env.NEXT_PUBLIC_CAP_COMPARE === 'true', // UX-02
  files: process.env.NEXT_PUBLIC_CAP_FILES === 'true', // A-03
  payments: process.env.NEXT_PUBLIC_CAP_PAYMENTS === 'true', // MI-04 / Q-02
  identity: process.env.NEXT_PUBLIC_CAP_IDENTITY === 'true', // MI-04 / A-01
  wReady: false as const, // Tier 3 stays hidden regardless of environment
});
