import { test, expect } from "@playwright/test";
import { gotoCatalog, openCatalogFilter, visibleButtonByText } from "./helpers/storefront";

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
});
