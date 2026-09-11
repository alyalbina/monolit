// SYNTHETIC DEMO FIXTURE — not live data. Mirrors design fixture.js (RS-2409). Deterministic; never randomised.
export const WALLET = {
  short: '8f3K…2Ac9',
  full: '8f3KqWdT2vRmN6yHpLcXz4bJ9sUeA7gQkFo5nVtB2Ac9',
  chain: 'Solana',
};
export const WINDOW = {
  label: '4 Sep 2026 00:00 – 11 Sep 2026 00:00 UTC',
  short: '4–10 Sep 2026 · UTC',
  formal: '2026-09-04 00:00 UTC ≤ event time < 2026-09-11 00:00 UTC',
  tz: 'UTC',
};
export const RESEARCH = {
  id: 'RS-2409',
  title: 'Upstream funders of 8f3K…2Ac9',
  query: 'Map the upstream funder graph of 8f3KqWdT2vRmN6yHpLcXz4bJ9sUeA7gQkFo5nVtB2Ac9',
  queryShort: 'Map the upstream funder graph of 8f3K…2Ac9',
  run: 'Run 1',
  runId: 'run_01',
  accepted: '11 Sep 2026, 06:41 UTC',
  completed: '11 Sep 2026, 06:44 UTC',
  mode: 'Standard · demo configuration',
  cap: 'Cap 2.00 credits (demo unit)',
  snapshot: 'Snapshot 11 Sep 2026, 06:40 UTC',
  total: '1,146,890.74',
  totalTransfers: 25,
  unresolvedTransfers: 2,
  wallets: 9,
  top3: '851,230.50',
  top3Pct: '74.2%',
};
export const SOURCES = [
  { n: 1, name: 'Demo Solana transfer index', time: 'Snapshot 11 Sep 2026, 06:40 UTC', coverage: 'Complete for window', fresh: 'Fresh', state: 'available' },
  { n: 2, name: 'Demo upstream hop index · depth 2', time: 'Snapshot 10 Sep 2026, 22:15 UTC', coverage: 'Ends before window end (missing 10 Sep 22:15 → 11 Sep 00:00)', fresh: 'Stale', state: 'stale' },
  { n: 3, name: 'Demo address label registry', time: 'Retrieved 11 Sep 2026, 06:40 UTC', coverage: 'Labels for 1 of 10 wallets', fresh: 'Fresh', state: 'partial' },
];
// Direct incoming USDC transfers to WALLET within WINDOW (depth 1)
export const FUNDERS = [
  { from: '3xVt…9Qe1', full: '3xVtPq8nLm2KsRdWcYb7HfJe4TgUaZo1NvXi6BkMw9Qe1', asset: 'USDC', amount: '412,500.00', n: 3, first: '04 Sep 02:14', last: '09 Sep 21:37', ref: 1, label: '' },
  { from: 'Dq7m…Lp4W', full: 'Dq7mXs4RtVb9NkLpWz2Yc6HfJa8GeUo3TiKn5MvQrLp4W', asset: 'USDC', amount: '250,000.00', n: 1, first: '05 Sep 11:02', last: '05 Sep 11:02', ref: 1, label: '' },
  { from: 'HnR2…Zc8f', full: 'HnR2vKw7TpLs4MqXb9YdCe3JfGa6UoZi1NkVt8BmWZc8f', asset: 'USDC', amount: '188,730.50', n: 6, first: '04 Sep 09:45', last: '10 Sep 18:20', ref: 1, label: '' },
  { from: '5Kje…Tb3N', full: '5KjeWq2LtRm8NpXs4VbYc7HdFa9GzUo1TiKn6MvBwTb3N', asset: 'USDC', amount: '120,000.00', n: 2, first: '06 Sep 14:30', last: '08 Sep 07:12', ref: 1, label: 'Exchange hot wallet · label source [3], demo registry' },
  { from: 'Ab9c…Wq2R', full: 'Ab9cRt4VmLp7NkXs2YbWd8HfJe5GaUo3TiKn1MvZqWq2R', asset: 'USDC', amount: '75,410.25', n: 4, first: '07 Sep 08:05', last: '10 Sep 12:44', ref: 1, label: '' },
  { from: '9pLm…Xe5K', full: '9pLmTs6RvWb3NkYd8XcZe4HfJa7GqUo2TiKn9MvBwXe5K', asset: 'USDC', amount: '49,999.99', n: 1, first: '08 Sep 19:58', last: '08 Sep 19:58', ref: 1, label: '' },
  { from: 'Fz4t…Nd7Y', full: 'Fz4tKw9RpLs2MqVb6YdXc8HfJe3GaUo7TiZn1NvBmNd7Y', asset: 'USDC', amount: '30,000.00', n: 2, first: '04 Sep 16:21', last: '05 Sep 09:03', ref: 1, label: '' },
  { from: 'Rw6b…Hk1P', full: 'Rw6bQs3TvLm9NkXp4YdWc7HfJe2GaUo8TiKn5MvZbHk1P', asset: 'USDC', amount: '12,250.00', n: 5, first: '06 Sep 03:40', last: '10 Sep 23:11', ref: 1, label: '' },
  { from: 'Ue3s…Mv8J', full: 'Ue3sPq7RtWb2NkLm5YdXc9HfJa4GzUo6TiKn8VvBqMv8J', asset: 'USDC', amount: '8,000.00', n: 1, first: '09 Sep 13:27', last: '09 Sep 13:27', ref: 1, label: '' },
  { from: 'Ct2n…Gy6Q', full: 'Ct2nVs8RpLm4NkXq7YbWd3HfJe9GaUo1TiKn2MvZtGy6Q', asset: 'USDC', amount: null, n: 2, first: '10 Sep 20:05', last: '10 Sep 21:48', ref: 2, label: '', note: 'Amount unavailable · source [2] decode failed' },
];
// Daily observed USDC inflow, UTC days. Sum = 1,146,890.74
export const DAILY = [
  { day: '04 Sep', v: '185,000.00', h: 125 },
  { day: '05 Sep', v: '295,000.00', h: 200 },
  { day: '06 Sep', v: '62,000.00', h: 42 },
  { day: '07 Sep', v: '60,410.25', h: 41 },
  { day: '08 Sep', v: '172,999.99', h: 117 },
  { day: '09 Sep', v: '210,500.00', h: 143 },
  { day: '10 Sep', v: '160,980.50', h: 109 },
];
// Depth-2 observed edges (source [2]); not counted as direct inflow
export const EDGES2 = [
  { from: 'Kp8w…Yd2S', to: '3xVt…9Qe1', asset: 'USDC', amount: '600,000.00', n: 2, ref: 2 },
  { from: '5Kje…Tb3N', to: '3xVt…9Qe1', asset: 'USDC', amount: '100,000.00', n: 1, ref: 2 },
  { from: '5Kje…Tb3N', to: 'Dq7m…Lp4W', asset: 'USDC', amount: '250,000.00', n: 1, ref: 2 },
  { from: 'Mz1q…Rt7E', to: 'HnR2…Zc8f', asset: 'USDC', amount: '95,000.00', n: 3, ref: 2 },
];
export const FOLLOWUPS = [
  { t: 'Where did 8f3K…2Ac9 send USDC in the same window?', s: 'Outgoing transfers · same wallet, chain, window' },
  { t: 'Trace depth-2 funders of 3xVt…9Qe1', s: 'TMP-02 · wallet 3xVt…9Qe1 · Solana · same window' },
  { t: 'Compare inflow of 3xVt…9Qe1 and Dq7m…Lp4W', s: '2 wallets · USDC · same window and units' },
];
// WAL-01 activity (same wallet/window). Received rows reconcile with FUNDERS.
export const ACTIVITY = [
  { time: '10 Sep 23:11', action: 'Received', asset: 'USDC', amount: '2,750.00', cp: 'Rw6b…Hk1P', ref: 1 },
  { time: '10 Sep 21:48', action: 'Received', asset: 'USDC', amount: null, cp: 'Ct2n…Gy6Q', ref: 2, note: 'Unavailable' },
  { time: '10 Sep 20:05', action: 'Received', asset: 'USDC', amount: null, cp: 'Ct2n…Gy6Q', ref: 2, note: 'Unavailable' },
  { time: '10 Sep 18:20', action: 'Received', asset: 'USDC', amount: '98,730.50', cp: 'HnR2…Zc8f', ref: 1 },
  { time: '10 Sep 15:02', action: 'Sent', asset: 'USDC', amount: '400,000.00', cp: 'Jm5x…Qa3T', ref: 1 },
  { time: '10 Sep 12:44', action: 'Received', asset: 'USDC', amount: '55,410.25', cp: 'Ab9c…Wq2R', ref: 1 },
  { time: '09 Sep 21:37', action: 'Received', asset: 'USDC', amount: '202,500.00', cp: '3xVt…9Qe1', ref: 1 },
  { time: '09 Sep 13:27', action: 'Received', asset: 'USDC', amount: '8,000.00', cp: 'Ue3s…Mv8J', ref: 1 },
  { time: '09 Sep 06:10', action: 'Sent', asset: 'SOL', amount: '4.20', cp: 'Jm5x…Qa3T', ref: 1 },
  { time: '08 Sep 19:58', action: 'Received', asset: 'USDC', amount: '49,999.99', cp: '9pLm…Xe5K', ref: 1 },
  { time: '08 Sep 07:12', action: 'Received', asset: 'USDC', amount: '60,000.00', cp: '5Kje…Tb3N', ref: 1 },
  { time: '07 Sep 22:31', action: 'Sent', asset: 'USDC', amount: '534,200.00', cp: 'Vn2k…Bs7L', ref: 1 },
];
export const FLOWS = [
  { label: 'USDC in', value: '1,146,890.74', unit: 'USDC', sub: '25 transfers · 2 unresolved' },
  { label: 'USDC out', value: '934,200.00', unit: 'USDC', sub: '7 transfers' },
  { label: 'USDC net', value: '+212,690.74', unit: 'USDC', sub: 'in − out, resolved amounts only' },
  { label: 'SOL in / out', value: '12.50 / 4.20', unit: 'SOL', sub: '2 / 1 transfers' },
  { label: 'USD valuation', value: '—', unit: '', sub: 'No price source in fixture' },
];
// MKT-01 feed — synthetic observations with demo schema
export const EVENTS = [
  { id: 'ev-01', fact: 'DEX volume 24h at 3.4× the 7-day daily median', entity: 'JUP · Solana', metric: '3.4×', unit: 'ratio', baseline: '7-day daily median · 4–10 Sep', window: '10 Sep 05:00 → 11 Sep 05:00 UTC', source: 'Demo DEX aggregate', time: '11 Sep 05:04 UTC', type: 'Token · volume', selected: true },
  { id: 'ev-02', fact: '412,500 USDC received from a single counterparty over 3 transfers', entity: '8f3K…2Ac9 · Solana', metric: '412,500.00', unit: 'USDC', baseline: 'Largest single counterparty in window', window: '4–9 Sep 2026 UTC', source: 'Demo Solana transfer index [1]', time: '11 Sep 06:40 UTC', type: 'Wallet · transfer' },
  { id: 'ev-03', fact: 'Perp funding −0.0182% / 8h, 30-day average +0.0041% / 8h', entity: 'SOL-PERP · Venue A (demo)', metric: '−0.0182%', unit: '/ 8h', baseline: '30-day average', window: '11 Sep 00:00 UTC funding interval', source: 'Demo derivatives feed', time: '11 Sep 00:02 UTC', type: 'Market · funding' },
  { id: 'ev-04', fact: 'Net USDC inflow to holders ≥ 1M WIF (demo cohort) turned positive after 6 negative days', entity: 'WIF · Solana', metric: '+1.9M', unit: 'USDC', baseline: 'Prior 6 days negative · cohort definition: demo', window: '10 Sep 2026 UTC day', source: 'Demo Solana transfer index [1]', time: '11 Sep 01:10 UTC', type: 'Token · cohort flow' },
  { id: 'ev-05', fact: 'USDC supply on Solana +1.2% vs 7 days ago', entity: 'USDC · Solana', metric: '+1.2%', unit: '7d', baseline: 'Supply on 4 Sep 00:00 UTC', window: '4 Sep → 11 Sep 00:00 UTC', source: 'Demo token supply index', time: '11 Sep 00:15 UTC', type: 'Token · supply' },
  { id: 'ev-06', fact: '1 new wallet moved > 100,000 USDC to a labelled exchange hot wallet', entity: 'Kp8w…Yd2S · Solana', metric: '135,000.00', unit: 'USDC', baseline: 'No prior activity in 30 days (demo index)', window: '10 Sep 2026 UTC day', source: 'Demo Solana transfer index [1] · label registry [3]', time: '10 Sep 23:50 UTC', type: 'Wallet · transfer' },
];
export const NAV_MAIN = ['Search', 'Research', 'Market', 'Saved'];
// Sidebar shortcuts BEFORE the demo research exists (B01 has none; B02)
export const PINNED_B02 = ['Funding rates BTC · 3 venues'];
export const RECENT_B02 = ['JUP volume vs 7-day median', 'WIF holder cohort flows · Sep', 'USDC supply on Solana · Aug'];
// After Run accepted (B03–B07)
export const PINNED_AFTER = ['Funding rates BTC · 3 venues'];
export const RECENT_AFTER = ['Upstream funders of 8f3K…2Ac9', 'JUP volume vs 7-day median', 'WIF holder cohort flows · Sep', 'USDC supply on Solana · Aug'];
export const CONTINUE = { title: 'JUP volume vs 7-day median', meta: 'Run 2 completed · 10 Sep 2026, 21:14 UTC · Saved' };
export const BALANCE = '48.20 credits · demo unit';

// Transaction hashes for the Activity table (WAL-01.R04). Display-only demo identifiers.
export const ACTIVITY_TX = ['4hQe…m2Kf', '9Lrt…Xa71', 'Bv3n…Pq0c', 'Zk8w…Ld4e', 'Ts1y…Hn9r', 'Mc6a…Wu2j', 'Gp4d…Yz8s', 'Rq9e…Bk3t', 'Nx2m…Cv7o', 'Ek5b…Ja1u', 'Wf7c…Qd6h', 'Hj3s…Tr5p'];

// WAL-01 coverage line (R02). Each clause names its source; prices have none in this fixture.
export const WALLET_COVERAGE = { transfers: 'Transfers complete [1]', labels: 'Labels 1 of 10 [3]', prices: 'Prices: no source' };
export const WALLET_ACTIVITY_TOTAL = 34;

// MKT-01 observation detail (R04). Values come from the approved frame, not invented at runtime.
export const EVENT_DETAIL: Record<string, {
  id: string; kind: string; headline: string; entity: { label: string; symbol: string; contract: string };
  rows: [string, string][]; coverage: string; series: { d: string; v: string; w: string }[]; seriesNote: string;
}> = {
  'ev-01': {
    id: 'ev-01', kind: 'Token · volume · ev-01',
    headline: 'DEX volume 24h at 3.4× the 7-day daily median',
    entity: { label: 'JUP · Solana', symbol: 'JUP', contract: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' },
    rows: [
      ['Observed value', '41.8M USDC-eq · 24 h volume (venue-reported)'],
      ['Baseline', '12.3M USDC-eq · 7-day daily median, 4–10 Sep UTC'],
      ['Ratio', '3.4× (41.8 / 12.3)'],
      ['Window', '10 Sep 05:00 → 11 Sep 05:00 UTC'],
      ['Source', 'Demo DEX aggregate · snapshot 11 Sep 05:04 UTC'],
    ],
    coverage: '3 of 4 tracked venues; venue D not reporting',
    series: [
      { d: '06 Sep', v: '11.9M', w: '28%' }, { d: '07 Sep', v: '9.8M', w: '23%' },
      { d: '08 Sep', v: '12.3M', w: '29%' }, { d: '09 Sep', v: '14.1M', w: '34%' },
      { d: '10→11 Sep', v: '41.8M', w: '100%' },
    ],
    seriesNote: 'Venue-reported volume; not a buy/sell classification and not a recommendation.',
  },
};
export const MARKET_ASOF = 'Data as-of 11 Sep 2026, 06:45 UTC · 6 sources';
export const MARKET_NEW_EVENTS = '3 new observations since 06:45 UTC';
export const MARKET_TOTAL = 41;
