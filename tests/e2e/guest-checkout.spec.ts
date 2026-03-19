import { test, expect } from '@playwright/test';
import { addCurrentProductToBag, gotoCatalog, openFirstProductFromCatalog } from './helpers/storefront';

test.describe('Guest Checkout Flow', () => {
  test('should allow a user to add item to cart and checkout via WhatsApp', async ({ page }) => {
    await gotoCatalog(page);
    await expect(page).toHaveTitle(/MOEMA/);

    await openFirstProductFromCatalog(page);
    await addCurrentProductToBag(page);
    await page.getByRole('link', { name: /checkout/i }).click();

    await expect(page).toHaveURL('/checkout');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="address"]', '123 Fashion St');
    await page.fill('input[name="city"]', 'Jakarta');
    await page.fill('input[name="postalCode"]', '12345');
    await page.fill('input[name="phone"]', '08123456789');

    const submitBtn = page.getByRole('button', { name: /order via whatsapp/i });
    await submitBtn.click();

    await expect.poll(() => page.url(), { timeout: 30000 }).toMatch(/(wa\.me|api\.whatsapp\.com)/);

    const url = page.url();
    const message = new URL(url).searchParams.get('text') ?? '';
    expect(url).toMatch(/(wa\.me|api\.whatsapp\.com)/);
    expect(url).toContain('text=');
    expect(message).toContain('John Doe');
  });

  test("mobile checkout footer stays reachable on a short viewport", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile-only regression");

    await page.setViewportSize({ width: 390, height: 600 });
    await gotoCatalog(page);
    await openFirstProductFromCatalog(page);
    await addCurrentProductToBag(page);
    await page.getByRole('link', { name: /checkout/i }).click();

    await expect(page).toHaveURL('/checkout');
    const mobileFooter = page.locator("[data-mobile-checkout-footer]");
    await expect(mobileFooter).toBeVisible();

    await page.fill('input[name="phone"]', '08123456789');
    await expect(mobileFooter.getByRole('button', { name: /order via whatsapp/i })).toBeVisible();
  });
});
