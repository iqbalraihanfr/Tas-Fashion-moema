import { test, expect } from '@playwright/test';
import { gotoCatalog, openCatalogFilter, visibleButtonByText } from './helpers/storefront';

test.describe('Catalog Filters & Sorting (nuqs State)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoCatalog(page);
  });

  test('should update URL when category is selected', async ({ page, isMobile }) => {
    if (isMobile) {
      await openCatalogFilter(page);
      await visibleButtonByText(page, 'Totes').click();
    } else {
      await page.getByRole('link', { name: /^totes$/i }).first().click();
    }

    await expect(page).toHaveURL(/category=totes/, { timeout: 10000 });
  });

  test('should update URL when sort option is changed', async ({ page, isMobile }) => {
    const sortTrigger = isMobile
      ? page.getByRole('button', { name: /^fitur$/i })
      : page.getByRole('button', { name: /urutkan berdasarkan/i });

    await sortTrigger.click();
    await page.getByRole('button', { name: /harga terendah/i }).click();
    await expect(page).toHaveURL(/sort=price_asc/, { timeout: 10000 });
  });
});
