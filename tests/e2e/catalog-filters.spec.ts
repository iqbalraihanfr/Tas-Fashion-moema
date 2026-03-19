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

  test('should change the mobile catalog grid when the mobile column selector changes', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only regression');

    const productCards = page.locator('[data-product-card]');
    await expect(productCards.nth(2)).toBeVisible();

    const before = await productCards.evaluateAll((cards) =>
      cards.slice(0, 3).map((card) => {
        const rect = card.getBoundingClientRect();
        return { x: Math.round(rect.x), y: Math.round(rect.y) };
      })
    );

    expect(before[2].y).toBeGreaterThan(before[0].y);

    await page.getByRole('button', { name: /3 columns on mobile/i }).click();

    await expect
      .poll(async () => {
        const positions = await productCards.evaluateAll((cards) =>
          cards.slice(0, 3).map((card) => {
            const rect = card.getBoundingClientRect();
            return { x: Math.round(rect.x), y: Math.round(rect.y) };
          })
        );

        return Math.abs(positions[2].y - positions[0].y) < 8;
      })
      .toBe(true);
  });

  test('should change the desktop catalog grid when the desktop column selector changes', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop-only regression');

    const productCards = page.locator('[data-product-card]');
    await expect(productCards.nth(3)).toBeVisible();

    const before = await productCards.evaluateAll((cards) =>
      cards.slice(0, 4).map((card) => {
        const rect = card.getBoundingClientRect();
        return { x: Math.round(rect.x), y: Math.round(rect.y) };
      })
    );

    expect(Math.abs(before[3].y - before[0].y)).toBeLessThan(8);

    await page.getByRole('button', { name: /3 columns on desktop/i }).click();

    await expect
      .poll(async () => {
        const positions = await productCards.evaluateAll((cards) =>
          cards.slice(0, 4).map((card) => {
            const rect = card.getBoundingClientRect();
            return { x: Math.round(rect.x), y: Math.round(rect.y) };
          })
        );

        return positions[3].y > positions[0].y;
      })
      .toBe(true);
  });
});
