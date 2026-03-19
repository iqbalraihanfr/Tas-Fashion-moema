import { test, expect } from "@playwright/test";
import { gotoCatalog, openCatalogFilter, openFirstProductFromCatalog, visibleButtonByText } from "./helpers/storefront";

test.describe("Mobile Navigation Smoke", () => {
  test.skip(({ isMobile }) => !isMobile, "Mobile-only smoke");

  test("mobile homepage CTA navigates to catalog", async ({ page }) => {
    await page.goto("/");

    const acceptButton = page.getByRole("button", { name: /^accept$/i });
    if (await acceptButton.count()) {
      await acceptButton.click();
    }

    await page.getByRole("link", { name: /view all|shop collection/i }).first().click();
    await expect(page).toHaveURL(/\/catalog/);
  });

  test("mobile filter sheet updates category URL state", async ({ page }) => {
    await gotoCatalog(page);
    await openCatalogFilter(page);
    await visibleButtonByText(page, "Totes").click();
    await expect(page).toHaveURL(/category=totes/);
  });

  test("mobile search routes into catalog search results", async ({ page }) => {
    await page.goto("/");

    const acceptButton = page.getByRole("button", { name: /^accept$/i });
    if (await acceptButton.count()) {
      await acceptButton.click();
    }

    await page.getByRole("button", { name: /open mobile search/i }).click();
    await page.locator(".md\\:hidden").getByPlaceholder("SEARCH...").fill("estiana");
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/catalog\?search=estiana/);
  });

  test("mobile sticky add to bag appears after scrolling PDP", async ({ page }) => {
    await gotoCatalog(page);
    await openFirstProductFromCatalog(page);

    await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "auto" }));
    const stickyBar = page.locator("[data-mobile-sticky-bar]");
    const stickyButton = stickyBar.getByRole("button", { name: /add to bag from sticky bar/i });

    await expect(stickyBar).toBeVisible();
    await page.waitForTimeout(200);
    await expect(stickyButton).toBeVisible();
    await stickyButton.evaluate((button: HTMLButtonElement) => button.click());

    await expect(page.getByText(/shopping bag \(\d+\)/i)).toBeVisible();
  });
});
