import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';


/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

dotenv.config(); //loading the github api key

if (!process.env.PAT_GH || !process.env.USER_GH) {
  throw new Error('Required environment variables PAT_GH and USER_GH are missing.');
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /*new timeout*/
  timeout: 120_000,
  expect: { timeout: 30_000 },
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://api.github.com',

    extraHTTPHeaders: {
      'User-Agent': `${process.env.USER_GH}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Authorization': `token ${process.env.PAT_GH}`
    },

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }, // or 'chrome-beta'      
    }
  ]

});
