import { test, expect } from '@playwright/test';
// Visual regression against approved HF frames (FR-001, FR-021-like prepared, FR-002/022/023/024/026). Baselines are captured on first run; compare in Light and Dark.
const cases = [ ['FR-001', '/research/new'], ['FR-002', '/research/RS-2409?run=run_01'], ['FR-023', '/research/RS-2409?run=run_01&demo=partial'], ['FR-024', '/research/RS-2409?run=run_01&demo=terminal_error'], ['FR-026', '/research/RS-2409?run=run_01&demo=status_unknown'] ] as const;
for (const theme of ['light', 'dark'] as const) for (const [id, url] of cases) test(id + ' ' + theme, async ({ page }) => {
  await page.emulateMedia({ colorScheme: theme }); await page.goto(url); await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot(id + '-' + theme + '.png', { fullPage: false, maxDiffPixelRatio: 0.01 });
});
