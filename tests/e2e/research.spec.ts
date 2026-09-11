import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** Prototype validation tasks T01–T13 executed against the running application.
 *  These assert product contracts (Blueprint §06, DOC-02/03/04), not cosmetics. */

const SESSION = '/research/RS-2409?run=run_01';
const composer = (page: Page) => page.getByRole('region', { name: /composer/i });

/** On narrow viewports the docked Next composer starts collapsed (SA §16). Expand it before
 *  asserting on its contents; the draft is retained across the toggle either way. */
async function openDock(page: Page) {
  const textarea = page.getByRole('textbox', { name: 'Research question' });
  // Below 768 the dock collapses shortly after mount. Wait for that to actually happen before
  // expanding — sampling too early catches the pre-collapse render and then it folds underneath us.
  if ((page.viewportSize()?.width ?? 1440) < 768) {
    const toggle = page.getByRole('button', { name: 'Expand next run composer' });
    await toggle.waitFor({ state: 'visible' });
    await toggle.click();
  }
  await expect(textarea).toBeVisible();
}

test.describe('T01 · First research — Prepare never runs', () => {
  test('Prepare fills the composer, stays on Home, and leaves Run gated', async ({ page }) => {
    await page.goto('/research/new');
    await page.getByRole('button', { name: 'Prepare Trace incoming wallet transfers' }).click();

    await expect(page.getByRole('textbox', { name: 'Research question' })).toHaveValue(/Map the upstream funder graph/);
    // Prepare must not navigate and must not start a run.
    await expect(page).toHaveURL(/\/research\/new$/);
    await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeDisabled();
  });

  test('the unfilled wallet parameter is reported as invalid on its own chip', async ({ page }) => {
    await page.goto('/research/new');
    await page.getByRole('button', { name: 'Prepare Trace incoming wallet transfers' }).click();

    const chip = page.getByRole('listitem').filter({ hasText: '[wallet address]' });
    await expect(chip).toContainText(/required/i);
    // The gate is stated inside the composer, next to the control it blocks.
    await expect(composer(page).getByRole('status')).toContainText(/invalid|required|scope/i);
    await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeDisabled();
  });
});

test.describe('T03 · Read and verify a result', () => {
  test('answer, Used scope and material caveat are all present', async ({ page }) => {
    await page.goto(SESSION);
    await expect(page.getByRole('heading', { name: 'Answer' })).toBeVisible();
    await expect(page.getByLabel('Used in this run')).toContainText('read-only snapshot');
    await expect(page.getByRole('note')).toContainText(/Material caveat/i);
  });

  test('citation opens the source inspector and Close returns focus to that citation', async ({ page }, testInfo) => {
    await page.goto(SESSION);
    const cite = page.getByRole('button', { name: /Source 1 for/ }).first();
    await cite.click();

    // Decision 02: the inspector is a split aside only when the main column still clears 720px.
    // Below that it is presented as a modal overlay instead, so accept either role.
    const width = testInfo.project.use.viewport?.width ?? 1440;
    const splits = width - (width < 1280 ? 64 : 232) - 336 - 48 - 24 >= 720;
    const inspector = splits
      ? page.getByRole('complementary', { name: 'Inspector' })
      : page.getByRole('dialog', { name: 'Inspector' });
    await expect(inspector).toBeVisible();
    // Evidence must carry window / retrieved / coverage, not just a source count.
    await expect(inspector).toContainText('Coverage');
    await expect(inspector).toContainText('Retrieved');

    await page.getByRole('button', { name: 'Close source inspector' }).click();
    await expect(cite).toBeFocused(); // P-04
  });
});

test.describe('T04 · Used and Next never merge', () => {
  test('Used snapshot is read-only while Next context stays editable', async ({ page }) => {
    await page.goto(SESSION);
    await openDock(page);
    await expect(page.getByLabel('Used in this run').getByRole('button')).toHaveCount(0);
    await expect(page.getByRole('list', { name: 'Next context' }).getByRole('button', { name: /Remove/ }).first()).toBeVisible();
  });

  test('removing a Next chip does not alter the Used snapshot', async ({ page }) => {
    await page.goto(SESSION);
    await openDock(page);
    const used = page.getByLabel('Used in this run');
    const before = await used.textContent();

    await page.getByRole('list', { name: 'Next context' }).getByRole('button', { name: /Remove/ }).first().click();

    await expect(used).toHaveText(before ?? '');
  });

  test('a suggested follow-up seeds the Next draft only', async ({ page }) => {
    await page.goto(SESSION);
    const used = page.getByLabel('Used in this run');
    const before = await used.textContent();

    await page.locator('#follow-ups').getByRole('button', { name: 'Prepare' }).first().click();

    await openDock(page);
    await expect(page.getByRole('textbox', { name: 'Research question' })).toHaveValue(/Where did/);
    await expect(used).toHaveText(before ?? '');
  });
});

test.describe('T05 · Partial result keeps what succeeded', () => {
  test('recovery block is shown and the completed table is not cleared', async ({ page }) => {
    await page.goto(SESSION + '&demo=partial');
    await expect(page.locator('#recovery')).toContainText(/did not complete/i);
    // Missing data must read as unavailable, never as zero.
    await expect(page.locator('#table-depth1')).toContainText(/unavailable/i);
    expect(await page.locator('#table-depth1 tbody tr').count()).toBeGreaterThan(8);
  });
});

test.describe('T06 · Unknown run status never duplicates a run', () => {
  test('offers a status check rather than a re-submit', async ({ page }) => {
    await page.goto(SESSION + '&demo=status_unknown');
    // Scoped past Next's own route announcer, which is also role="alert".
    const alert = page.getByRole('alert').filter({ hasText: /status unknown/i });
    await expect(alert).toBeVisible();
    await expect(alert.getByRole('button', { name: 'Check status' })).toBeVisible();
    // The run is labelled unknown, not failed: an unreachable server is not a terminal state.
    await expect(page.getByRole('button', { name: /^Run 1 ·/ })).toContainText('Status unknown');
    // The last confirmed output is still on screen, and Run cannot be fired again.
    await expect(page.locator('#table-depth1')).toBeVisible();
    await openDock(page);
    await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeDisabled();
  });
});

test.describe('Search (OVR-01)', () => {
  test('opens over the workspace, and opening a result does not run research', async ({ page }) => {
    await page.goto(SESSION);
    await page.getByRole('button', { name: 'Search' }).click();

    const dialog = page.getByRole('dialog', { name: 'Search' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('textbox').fill('8f3K');
    await dialog.getByRole('option').first().click();

    await expect(page).toHaveURL(/\/wallet\/solana\//);
  });

  test('rejects an unsupported identifier without guessing a chain', async ({ page }) => {
    await page.goto('/research/new');
    await page.getByRole('button', { name: 'Search' }).click();
    const dialog = page.getByRole('dialog', { name: 'Search' });
    await dialog.getByRole('textbox').fill('0OIl'.repeat(8));
    await expect(dialog.getByRole('status')).toContainText(/not a supported identifier/i);
  });

  test('Escape closes search and leaves the draft untouched', async ({ page }) => {
    await page.goto('/research/new');
    await page.getByRole('textbox', { name: 'Research question' }).fill('smart money on Solana');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.getByRole('dialog', { name: 'Search' }).getByRole('textbox').press('Escape');

    await expect(page.getByRole('dialog', { name: 'Search' })).toBeHidden();
    await expect(page.getByRole('textbox', { name: 'Research question' })).toHaveValue('smart money on Solana');
  });
});

test.describe('Accessibility', () => {
  for (const [name, url] of [['Home', '/research/new'], ['Session', SESSION], ['Partial', SESSION + '&demo=partial']] as const) {
    test(`${name} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(url);
      await page.getByRole('heading').first().waitFor();
      const r = await new AxeBuilder({ page }).analyze();
      const serious = r.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
      expect(serious.map(v => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
    });
  }
});
