import { defineConfig } from '@playwright/test';

/**
 * Playwright configuration for Hwatu Go-Stop E2E tests
 * 
 * This config is for integration testing of game logic (NOT UI automation).
 * Tests simulate full game flows using game modules directly.
 */
export default defineConfig({
  testDir: './e2e',
  
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }]
  ],
  
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  timeout: 10000,
});
