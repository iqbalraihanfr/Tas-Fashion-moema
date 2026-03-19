import { test, expect } from "@playwright/test";
import { goToAdminSection, loginAsAdmin } from "./helpers/admin";
import { cleanupQaColorByName } from "./helpers/qa-cleanup";

test.describe("Admin Smoke", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(({ isMobile }) => isMobile, "Admin smoke is desktop-first for now");

  test("admin can sign in and navigate dashboard sections", async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByRole("heading", { name: /dashboard overview/i })).toBeVisible();
    await goToAdminSection(page, "Products");
    await expect(page.getByRole("heading", { name: /product management/i })).toBeVisible();

    await goToAdminSection(page, "Colors");
    await expect(page.getByRole("heading", { name: /color palette/i })).toBeVisible();

    await goToAdminSection(page, "Showcase");
    await expect(page.getByRole("heading", { name: /showcase manager/i })).toBeVisible();

    await goToAdminSection(page, "Orders");
    await expect(page.getByRole("heading", { name: /orders management/i })).toBeVisible();
  });

  test("admin can add and remove a color", async ({ page }) => {
    const colorName = `QA Smoke ${Date.now()}`;
    try {
      await loginAsAdmin(page);
      await goToAdminSection(page, "Colors");

      await page.getByLabel(/color name/i).fill(colorName);
      await page.locator('input[type="color"]').fill("#123456");
      await page.getByRole("button", { name: /^add$/i }).click();

      const colorCard = page.getByText(colorName).first();
      await expect(colorCard).toBeVisible();

      await page.reload();
      await page.waitForLoadState("networkidle");
      await expect(page.getByRole("heading", { name: /color palette/i })).toBeVisible();

      const persistedColorCard = page.getByText(colorName).first();
      await expect(persistedColorCard).toBeVisible();

      await persistedColorCard.hover();
      await page.getByTitle(`Delete ${colorName}`).click();

      await expect(page.getByText(colorName)).toHaveCount(0);
    } finally {
      await cleanupQaColorByName(colorName);
    }
  });
});
