import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** T07 Wallet investigation and T08 Market → Research (Blueprint §13 Data → AI).
 *  The contract under test: Investigate carries the exact object into a draft and stops there. */

const WALLET = '/wallet/solana/8f3KqWdT2vRmN6yHpLcXz4bJ9sUeA7gQkFo5nVtB2Ac9';

test.describe('T07 · WAL-01 Wallet Detail', () => {
  test('shows identity, window, coverage and observed activity', async ({ page }) => {
    await page.goto(WALLET);
    await expect(page.getByRole('heading', { name: '8f3K…2Ac9' })).toBeVisible();
    // Never claims ownership of an investigated address.
    await expect(page.getByText(/no ownership claim/i)).toBeVisible();
    await expect(page.getByLabel('Window and coverage')).toContainText('Coverage');
    expect(await page.locator('table tbody tr').count()).toBeGreaterThan(8);
  });

  test('unavailable amounts read as unavailable, never as zero', async ({ page }) => {
    await page.goto(WALLET);
    await expect(page.locator('table')).toContainText('— unavailable');
    await expect(page.getByText(/not zero. Transfer ≠ trade/i)).toBeVisible();
  });

  test('assets are not summed without a valuation source', async ({ page }) => {
    await page.goto(WALLET);
    await expect(page.getByText(/Assets are not summed/i)).toBeVisible();
    await expect(page.getByText(/Prices: no source/i)).toBeVisible();
  });

  test('filtering activity narrows the rows without losing the table', async ({ page }) => {
    await page.goto(WALLET);
    const all = await page.locator('table tbody tr').count();
    await page.getByRole('button', { name: 'Sent', exact: true }).click();
    const sent = await page.locator('table tbody tr').count();
    expect(sent).toBeGreaterThan(0);
    expect(sent).toBeLessThan(all);
  });

  test('Investigate prepares a draft with wallet + window and does not run', async ({ page }) => {
    await page.goto(WALLET);
    await page.getByRole('button', { name: 'Investigate →' }).click();

    await expect(page).toHaveURL(/\/research\/new/);
    await expect(page.getByRole('textbox', { name: 'Research question' })).toHaveValue(/Trace incoming transfers/);
    // The origin travelled with it, and nothing was executed.
    await expect(page.getByText(/Prepared from/)).toContainText('Wallet 8f3K…2Ac9 · Solana');
    await expect(page.getByText(/Nothing has run yet/i)).toBeVisible();
    await expect(page.getByRole('list', { name: 'Next context' })).toContainText('8f3K…2Ac9');
  });
});

test.describe('T08 · MKT-01 Market Intelligence', () => {
  test('every observation states fact, metric, baseline/window and source', async ({ page }) => {
    await page.goto('/market');
    const rows = page.getByRole('listitem');
    await expect(rows).toHaveCount(6);
    const first = rows.first();
    await expect(first).toContainText('JUP · Solana');
    await expect(first).toContainText('7-day daily median');
    await expect(first).toContainText('Demo DEX aggregate');
  });

  test('inspector opens with the underlying observation and Close returns focus', async ({ page }, testInfo) => {
    await page.goto('/market');
    const trigger = page.getByRole('button', { name: /Inspect observation/ }).nth(1);
    await trigger.click();

    const width = testInfo.project.use.viewport?.width ?? 1440;
    const splits = width - (width < 1280 ? 64 : 232) - 336 - 48 - 24 >= 720;
    const inspector = splits ? page.getByRole('complementary', { name: 'Inspector' }) : page.getByRole('dialog', { name: 'Inspector' });
    await expect(inspector).toBeVisible();

    await page.getByRole('button', { name: 'Close observation inspector' }).click();
    await expect(trigger).toBeFocused();
  });

  test('new observations are announced, not inserted above the reading position', async ({ page }) => {
    await page.goto('/market');
    const rows = page.getByRole('listitem');
    const firstBefore = await rows.first().textContent();
    await expect(page.getByText(/new observations since/i)).toBeVisible();

    await page.getByRole('button', { name: 'Show new events' }).click();

    await expect(rows.first()).toHaveText(firstBefore ?? '');
  });

  test('Investigate carries the observation into a draft without running it', async ({ page }) => {
    await page.goto('/market');
    await page.getByRole('button', { name: /^Investigate:/ }).first().click();

    await expect(page).toHaveURL(/\/research\/new/);
    await expect(page.getByText(/Prepared from/)).toContainText('Market observation');
    await expect(page.getByRole('list', { name: 'Next context' })).toContainText('JUP · Solana');
  });
});

test.describe('Accessibility · new screens', () => {
  for (const [name, url] of [['Wallet', WALLET], ['Market', '/market']] as const) {
    test(`${name} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(url);
      await page.getByRole('heading').first().waitFor();
      const r = await new AxeBuilder({ page }).analyze();
      const serious = r.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
      expect(serious.map(v => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
    });
  }
});
