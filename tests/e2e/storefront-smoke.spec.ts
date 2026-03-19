import { test, expect } from "@playwright/test";
import { addCurrentProductToBag, gotoCatalog, openFirstProductFromCatalog } from "./helpers/storefront";

test.describe("Storefront Smoke", () => {
  test("homepage links into the collection", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("img", { name: /moema/i }).first()).toBeVisible();
    await page.getByRole("link", { name: /shop collection|view all/i }).first().click();
    await page.waitForURL(/\/catalog/);
    await expect(page.getByRole("button", { name: /filter/i })).toBeVisible();
  });

  test("shopper can add a product to bag and open cart page", async ({ page }) => {
    await gotoCatalog(page);
    await openFirstProductFromCatalog(page);
    await addCurrentProductToBag(page);

    await page.getByRole("link", { name: /view bag/i }).click();
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.locator("main").getByRole("heading", { name: /^shopping bag$/i })).toBeVisible();
  });

  test("shopper can reach checkout shell from bag", async ({ page }) => {
    await gotoCatalog(page);
    await openFirstProductFromCatalog(page);
    await addCurrentProductToBag(page);

    await page.getByRole("link", { name: /checkout/i }).click();
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByRole("heading", { name: /contact information/i })).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/first name/i)).toBeVisible();
  });
});
