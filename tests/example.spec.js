// @ts-check
import { test, expect } from '@playwright/test';

test('verify homepage title', async ({ page }) => {
  // Navigate to Playwright homepage
  await page.goto('https://playwright.dev/', { waitUntil: 'domcontentloaded' });

  // Assert the title contains 'Playwright'
  await expect(page).toHaveTitle(/Playwright/, { timeout: 5000 });
});

test('navigate to Get Started and verify Installation heading', async ({ page }) => {
  // Go to homepage
  await page.goto('https://playwright.dev/', { waitUntil: 'domcontentloaded' });

  // Wait for "Get started" link to be visible and click
  const getStartedLink = page.getByRole('link', { name: 'Get started' });
  await expect(getStartedLink).toBeVisible({ timeout: 5000 });
  await getStartedLink.click();

  // Wait for "Installation" heading to be visible on the next page
  const installationHeading = page.getByRole('heading', { name: 'Installation' });
  await expect(installationHeading).toBeVisible({ timeout: 7000 });
});

test('fails on wrong title', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  
  // This will FAIL because the title does not contain "Playwright123"
  await expect(page).toHaveTitle(/Playwright123/);
});

test('fails on missing heading', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  
  // Click the "Get started" link
  await page.getByRole('link', { name: 'Get started' }).click();

  // This will FAIL because the heading "Getting Started Guide" does not exist
  await expect(page.getByRole('heading', { name: 'Getting Started Guide' })).toBeVisible();
});
