import type { DataAdapter, Quote } from '../types';
import type { Balance, Capabilities, Draft, PaymentAttempt, Research, Run, SavedReference, SourceSnapshot, ChartArtifact, UsageRecord } from '@/domain/types';
/** Real adapter — endpoints, schemas and status semantics are NOT yet contracted (Q-01, Q-02, A-01, A-03, MI-04).
 *  Every method throws NotContracted until a documented endpoint exists. Do not stub with plausible responses. */
class NotContracted extends Error { constructor(m: string) { super('Backend contract missing: ' + m + ' (see DOC-03/DOC-05/DOC-06)'); } }
export class RealAdapter implements DataAdapter {
  readonly mode = 'real' as const;
  constructor(private base: string) {}
  async capabilities(): Promise<Capabilities> { throw new NotContracted('GET /capabilities'); }
  async listResearch(): Promise<Research[]> { throw new NotContracted('GET /research'); }
  async getResearch(): Promise<Research | null> { throw new NotContracted('GET /research/:id'); }
  async saveDraft(): Promise<Draft> { throw new NotContracted('PUT /drafts/:id'); }
  async preflight(): Promise<Quote> { throw new NotContracted('POST /runs/preflight (Q-02 quote/cap)'); }
  async submitRun(): Promise<Run> { throw new NotContracted('POST /runs (idempotency key)'); }
  async getRun(): Promise<Run | null> { throw new NotContracted('GET /runs/:id'); }
  async cancelRun(): Promise<Run> { throw new NotContracted('POST /runs/:id/cancel'); }
  async getSource(): Promise<SourceSnapshot | null> { throw new NotContracted('GET /sources/:ref'); }
  async getChart(): Promise<ChartArtifact | null> { throw new NotContracted('GET /artifacts/:id'); }
  async listSaved(): Promise<SavedReference[]> { throw new NotContracted('GET /saved'); }
  async balance(): Promise<Balance> { throw new NotContracted('GET /billing/balance'); }
  async usage(): Promise<UsageRecord[]> { throw new NotContracted('GET /billing/usage'); }
  async payments(): Promise<PaymentAttempt[]> { throw new NotContracted('GET /billing/payments'); }
  async verifyPayment(): Promise<PaymentAttempt> { throw new NotContracted('GET /billing/payments/:ref (server verification)'); }
}
