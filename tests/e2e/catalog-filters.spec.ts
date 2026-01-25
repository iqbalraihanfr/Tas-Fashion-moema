import { test, expect } from '@playwright/test';

test.describe('Catalog Filters & Sorting (nuqs State)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog');
  });

  test('should update URL when category is selected', async ({ page }) => {
    // 1. Wait for the real title to appear (ending the skeleton state)
    await expect(page.getByText('The Collection')).toBeVisible({ timeout: 20000 });

    // 2. Click on "Totes" category in the sidebar
    // We use getByText to be agnostic of button vs link during hydration
    const totesFilter = page.locator('aside').getByText('Totes', { exact: true });
    await totesFilter.click();

    // 3. Verify URL contains category=totes
    await expect(page).toHaveURL(/category=totes/, { timeout: 10000 });
  });

  test('should update URL when sort option is changed', async ({ page }) => {
    await expect(page.getByText('The Collection')).toBeVisible({ timeout: 20000 });

    // 1. Click "Price Low" sort
    const priceLowSort = page.getByText('Price Low', { exact: true });
    await priceLowSort.click();

    // 2. Verify URL
    await expect(page).toHaveURL(/sort=price_asc/, { timeout: 10000 });
  });
});