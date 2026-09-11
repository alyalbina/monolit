/** Display formatters. Every research timestamp is absolute and UTC-labelled (Blueprint §12): the
 *  product distinguishes event time, observation window, and retrieved/as-of time, so a bare
 *  localised date would lose the part that matters. Never renders a relative "2 hours ago". */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-09-11T06:41:12Z" → "11 Sep 2026, 06:41 UTC". Passes through anything not ISO-shaped, so
 *  fixture strings that are already display-formatted are left alone. */
export function utcStamp(iso: string | undefined | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime()) || !/^\d{4}-\d{2}-\d{2}T/.test(iso)) return iso;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`;
}

/** Amounts keep their unit and precision at the call site; null means "not available", never zero. */
export function amount(v: number | null | undefined, digits = 2): string {
  return v == null ? '—' : v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
