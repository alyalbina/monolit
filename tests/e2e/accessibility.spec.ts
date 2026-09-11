import { test, expect, type Page } from '@playwright/test';

/** Accessibility acceptance from the DS contract (Signature pass §14): target sizes, tabular
 *  numerals on data, a reachable skip link, 200% text zoom, and forced-colors distinctions.
 *  These are baseline rules of the accepted UX, not branded styling. */

const SESSION = '/research/RS-2409?run=run_01';

/** Measures every interactive element, counting the transparent .am-hit area where one is used. */
async function undersizedTargets(page: Page, min: number) {
  return page.evaluate((min) => {
    const out: { name: string; w: number; h: number }[] = [];
    document.querySelectorAll('button,a,[role="button"],input,select,textarea').forEach((el) => {
      let r: { width: number; height: number } = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return; // not rendered
      // The skip link is deliberately clipped until focused; it is measured separately below.
      if (el.classList.contains('am-sr')) return;
      if (el.classList.contains('am-hit')) {
        const cs = getComputedStyle(el, '::after');
        r = { width: Math.max(r.width, parseFloat(cs.minWidth) || 0), height: Math.max(r.height, parseFloat(cs.minHeight) || 0) };
      }
      if (r.height < min - 0.5 || r.width < min - 0.5)
        out.push({ name: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) });
    });
    return out;
  }, min);
}

test('every interactive target meets the DS minimum for the pointer type', async ({ page }, testInfo) => {
  const width = testInfo.project.use.viewport?.width ?? 1440;
  const touch = !!testInfo.project.use.hasTouch;
  await page.goto(SESSION);
  await page.getByRole('heading', { name: 'Answer' }).waitFor();
  if (width < 768) {
    const toggle = page.getByRole('button', { name: 'Expand next run composer' });
    await toggle.waitFor({ state: 'visible' });
    await toggle.click();
  }
  // 44 px on touch, 32 px with a fine pointer. Density must not shrink a target to icon size.
  expect(await undersizedTargets(page, touch ? 44 : 32)).toEqual([]);
});

test('research tables render tabular lining numerals', async ({ page }) => {
  await page.goto(SESSION);
  await page.locator('#table-depth1 table').waitFor();
  // The `font` shorthand silently resets font-variant-numeric, so this guards against regressions.
  const fvn = await page.locator('#table-depth1 table').evaluate(el => getComputedStyle(el).fontVariantNumeric);
  expect(fvn).toContain('tabular-nums');
});

test('the skip link is hidden until focused, then reachable and usable', async ({ page }) => {
  await page.goto('/research/new');
  await page.getByRole('heading').first().waitFor();
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  const box = await skip.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
});

test('200% text zoom does not introduce a page-wide horizontal scroll', async ({ page }) => {
  await page.goto(SESSION);
  await page.getByRole('heading', { name: 'Answer' }).waitFor();
  await page.addStyleTag({ content: 'html{font-size:32px !important}' });
  await page.waitForTimeout(300);
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(sw).toBeLessThanOrEqual(cw + 1);
});

test('no page-wide horizontal scroll at this viewport', async ({ page }) => {
  for (const url of ['/research/new', SESSION, SESSION + '&demo=partial']) {
    await page.goto(url);
    await page.getByRole('heading').first().waitFor();
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(sw, `horizontal scroll at ${url}`).toBeLessThanOrEqual(cw + 1);
  }
});

test.describe('forced colors', () => {
  test.use({ forcedColors: 'active' });
  test('selected navigation stays distinguishable and focus stays visible', async ({ page }) => {
    await page.goto(SESSION);
    await page.getByRole('heading', { name: 'Answer' }).waitFor();
    const distinct = await page.evaluate(() => {
      const cur = document.querySelector('nav [aria-current="page"]')!;
      const other = [...document.querySelectorAll('nav a')].find(a => !a.hasAttribute('aria-current'))!;
      return getComputedStyle(cur).backgroundColor !== getComputedStyle(other).backgroundColor;
    });
    expect(distinct).toBe(true);

    const cite = page.getByRole('button', { name: /Source 1 for/ }).first();
    await cite.focus();
    const outline = await cite.evaluate(el => getComputedStyle(el).outlineWidth);
    expect(parseFloat(outline)).toBeGreaterThan(0);
  });
});
