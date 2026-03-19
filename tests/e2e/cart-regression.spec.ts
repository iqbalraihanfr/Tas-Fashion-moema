import { expect, test } from "@playwright/test";
import { addCurrentProductToBag, gotoCatalog, openFirstProductFromCatalog } from "./helpers/storefront";

test.describe("Cart Regression", () => {
  test("shopper can change quantity and remove an item from the bag drawer", async ({ page }) => {
    await gotoCatalog(page);
    await openFirstProductFromCatalog(page);
    await addCurrentProductToBag(page);

    await page.getByRole("link", { name: /view bag/i }).click();
    await expect(page).toHaveURL(/\/cart/);
    const cartPage = page.locator("main").filter({
      has: page.getByRole("heading", { name: /^shopping bag$/i }),
    }).last();

    await cartPage.getByLabel(/increase quantity/i).click();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const cart = JSON.parse(window.localStorage.getItem("cart") || "[]");
          return cart[0]?.quantity ?? 0;
        })
      )
      .toBe(2);

    await cartPage.getByLabel(/remove /i).click();
    await expect(page.getByRole("heading", { name: /your bag is empty/i })).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const cart = JSON.parse(window.localStorage.getItem("cart") || "[]");
          return cart.length;
        })
      )
      .toBe(0);
  });

  test("cart contents persist after reloading the bag page", async ({ page }) => {
    await gotoCatalog(page);
    await openFirstProductFromCatalog(page);
    await addCurrentProductToBag(page);

    await page.getByRole("link", { name: /view bag/i }).click();
    await expect(page).toHaveURL(/\/cart/);
    const cartPage = page.locator("main").filter({
      has: page.getByRole("heading", { name: /^shopping bag$/i }),
    }).last();

    await expect(cartPage.getByLabel(/remove /i).first()).toBeVisible();

    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/cart/);
    const reloadedCartPage = page.locator("main").filter({
      has: page.getByRole("heading", { name: /^shopping bag$/i }),
    }).last();

    await expect(reloadedCartPage.getByLabel(/remove /i).first()).toBeVisible();
    await expect(reloadedCartPage.getByRole("heading", { name: /^shopping bag$/i })).toBeVisible();
  });

  test("mobile cart footer stays reachable on a short viewport", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile-only regression");

    await page.setViewportSize({ width: 390, height: 600 });
    await gotoCatalog(page);
    await openFirstProductFromCatalog(page);
    await addCurrentProductToBag(page);

    await page.getByRole("link", { name: /view bag/i }).click();
    await expect(page).toHaveURL(/\/cart/);

    const mobileFooter = page.locator("[data-mobile-cart-footer]");
    await expect(mobileFooter).toBeVisible();
    await expect(mobileFooter.getByRole("link", { name: /checkout/i })).toBeVisible();
  });
});
