// Domain entities per Blueprint §06 / DOC-02 / DOC-03. Display view-models live in src/ui, mapped explicitly.
export type ChainId = 'solana' | 'ethereum' | 'base' | 'arbitrum';
export type EntityType = 'wallet' | 'token' | 'market' | 'protocol' | 'transaction' | 'account';
export interface CanonicalEntity { type: EntityType; chain?: ChainId; id: string; display: string; venue?: string }
export type Mode = 'flash' | 'pro' | 'ultima'; // Decision 03 — labels Flash / Pro / Ultima
export interface Timeframe { startUtc: string; endUtc: string; tz: 'UTC'; label: string }
export interface ContextItem { kind: 'entity' | 'window' | 'artifact' | 'observation' | 'file' | 'memory'; entity?: CanonicalEntity; window?: Timeframe; ref?: string; label: string; status?: 'resolving' | 'valid' | 'invalid' | 'unsupported'; reason?: string }
export interface ContextSnapshot { readonly items: readonly ContextItem[]; readonly mode: Mode; readonly cap?: { amount: number; unit: string }; readonly sources: readonly string[]; readonly snapshotAt: string }
export interface Draft { draftId: string; researchId?: string; query: string; context: ContextItem[]; mode: Mode; parentRunId?: string; revision: number; savedState: 'saving' | 'saved' | 'save_failed' | 'local_only'; savedAt?: string }
export type RunStatus = 'draft' | 'preflight' | 'accepted' | 'queued' | 'running' | 'completed' | 'partial' | 'failed' | 'cancel_requested' | 'cancelled';
export type ClientKnowledge = 'known' | 'status_unknown'; // status_unknown is client-side, never a backend terminal state
export interface Run { runId: string; researchId: string; status: RunStatus; knowledge: ClientKnowledge; used: ContextSnapshot; query: string; parentRunId?: string; acceptedAt?: string; completedAt?: string; idempotencyKey: string; operations: Operation[]; usage?: { amount: number; unit: string; settled: boolean }; artifacts: ResultArtifact[] }
export interface Operation { id: string; label: string; sourceRef: string; status: 'queued' | 'running' | 'completed' | 'failed' | 'unavailable'; at?: string; reason?: string }
export type BlockType = 'RB-01' | 'RB-02' | 'RB-03' | 'RB-04' | 'RB-05' | 'RB-06' | 'RB-07' | 'RB-08' | 'RB-09' | 'RB-10' | 'RB-11' | 'RB-12';
export interface ResultArtifact { artifactId: string; version: number; type: BlockType; title?: string; anchor: string; payload: unknown; claims: Claim[]; sourceRefs: string[] }
export interface Claim { claimId: string; text: string; citations: EvidenceReference[]; material?: boolean }
export interface EvidenceReference { sourceRef: string; recordIds: string[]; state: 'available' | 'stale' | 'partial' | 'unavailable' }
export interface SourceSnapshot { sourceRef: string; name: string; snapshotAt?: string; retrievedAt?: string; freshness: 'fresh' | 'stale' | 'unknown'; coverage: string; state: 'available' | 'stale' | 'partial' | 'unavailable'; externalUrl?: string }
export interface Research { researchId: string; owner: string; title: string; createdAt: string; updatedAt: string; pinned: boolean; drafts: Draft[]; runs: Run[]; saveState: Draft['savedState'] }
export interface SavedReference { id: string; kind: 'entity' | 'chart' | 'template'; target: string; origin: string; version?: string; savedAt: string; available: boolean; reason?: string }
export interface ChartArtifact { artifactId: string; version: number; researchId: string; runId: string; title: string; metric: string; timeframe: Timeframe; series: { name: string; points: { x: string; y: number | null }[] }[]; unit: string; sourceRef: string }
export interface Balance { available: number; reserved: number; pending: number; unit: string; asOf: string }
export interface UsageRecord { at: string; runId: string; amount: number; unit: string; status: 'settled' | 'reserved' | 'released' }
export interface PaymentAttempt { ref: string; amount: number; unit: string; startedAt: string; status: 'pending' | 'settled' | 'failed'; reason?: string }
export interface SessionReturnIntent { route: string; safeSummary: string; draftId?: string } // never the private query text
export interface Capabilities { compare: boolean; files: boolean; payments: boolean; identity: boolean; wReady: false }
