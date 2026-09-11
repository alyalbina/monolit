import { describe, expect, it } from 'vitest';
import { canTransition, isTerminal, nextRunAllowed, displayStatus } from './runLifecycle';
describe('run lifecycle (DOC-03)', () => {
  it('follows draft → preflight → accepted → queued → running → terminal', () => {
    expect(canTransition('draft', 'preflight')).toBe(true); expect(canTransition('running', 'partial')).toBe(true); expect(canTransition('completed', 'running')).toBe(false);
  });
  it('cancel_requested is not terminal; cancelled is', () => { expect(isTerminal('cancel_requested')).toBe(false); expect(isTerminal('cancelled')).toBe(true); });
  it('blocks a second Run while one is active', () => { expect(nextRunAllowed(['completed', 'running'])).toBe(false); expect(nextRunAllowed(['completed', 'partial'])).toBe(true); });
  it('status_unknown is a client knowledge state, not failed', () => { expect(displayStatus('running', 'status_unknown')).toBe('Status unknown'); });
});
