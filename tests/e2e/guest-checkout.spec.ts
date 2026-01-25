import { test, expect } from '@playwright/test';

test.describe('Guest Checkout Flow', () => {
  test('should allow a user to add item to cart and checkout via WhatsApp', async ({ page }) => {
    // 1. Visit Catalog
    await page.goto('/catalog');
    await expect(page).toHaveTitle(/MOEMA/);

    // 2. Click on the first product
    // Assuming product cards are links or have a link inside
    const firstProduct = page.locator('a[href^="/product/"]').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();

    // 3. Add to Cart
    // Wait for product detail page
    await expect(page.locator('h1')).toBeVisible();
    
    // Click "Add to Bag"
    const addToBagBtn = page.getByRole('button', { name: /add to bag/i });
    await expect(addToBagBtn).toBeVisible();
    await addToBagBtn.click();

    // 4. Verify Cart Sheet opens
    const checkoutLink = page.getByRole('link', { name: /checkout/i });
    await expect(checkoutLink).toBeVisible();
    
    // Click Checkout
    await checkoutLink.click();

    // 5. Fill Checkout Form
    await expect(page).toHaveURL('/checkout');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="address"]', '123 Fashion St');
    await page.fill('input[name="city"]', 'Jakarta');
    await page.fill('input[name="postalCode"]', '12345');
    await page.fill('input[name="phone"]', '08123456789');

    // 6. Submit Order
    const submitBtn = page.getByRole('button', { name: /order via whatsapp/i });
    await submitBtn.click();

    // 7. Verify Redirect to WhatsApp
    // Since we can't easily verify external URL in some envs, we check if page url changes 
    // or if we can intercept the navigation.
    // For this test, we expect the URL to contain 'wa.me'
    await page.waitForURL(/wa\.me/);
    
    const url = page.url();
    expect(url).toContain('wa.me');
    expect(url).toContain('text=');
    expect(url).toContain(encodeURIComponent('John Doe')); // Name should be in the text
  });
});
