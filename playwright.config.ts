import { defineConfig, devices } from '@playwright/test';

// This environment ships a pinned Chromium and blocks `playwright install`. When PW_CHROMIUM_PATH is
// set we launch that binary; otherwise Playwright resolves its own download as usual.
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  // The demo adapter is deterministic, so a retry only ever hides a real failure.
  retries: 0,
  use: { baseURL: 'http://localhost:3000', colorScheme: 'light', launchOptions: { executablePath } },
  webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: true, timeout: 120_000 },
  projects: [
    { name: 'desktop-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'laptop-1120', use: { ...devices['Desktop Chrome'], viewport: { width: 1120, height: 800 } } },
    { name: 'tablet-834', use: { ...devices['Desktop Chrome'], viewport: { width: 834, height: 1112 } } },
    { name: 'mobile-390', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: false, hasTouch: true } },
    { name: 'reflow-320', use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 700 } } },
  ],
});
