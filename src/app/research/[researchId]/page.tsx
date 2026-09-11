import { Suspense } from 'react';
import { Session } from './Session';
import * as F from '@/adapters/demo/fixture';

/** The demo fixture holds a single research; static export pre-renders exactly that one. */
export function generateStaticParams() {
  return [{ researchId: F.RESEARCH.id }];
}
export const dynamicParams = false;
/** RES-02 · /research/:researchId. The session reads ?run= and ?demo= from the URL, so it sits behind a
 *  Suspense boundary — Next requires one around useSearchParams for anything statically rendered. */
export default function Page() {
  return <Suspense fallback={<p role="status" style={{ padding: 24, color: 'var(--am-text-tertiary)' }}>Loading research…</p>}><Session /></Suspense>;
}
