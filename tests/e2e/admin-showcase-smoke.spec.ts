import { expect, test } from "@playwright/test";
import { createQaSuffix, goToAdminSection, loginAsAdmin, uploadImageAndApplyCrop } from "./helpers/admin";

test.describe("Admin Showcase Smoke", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(({ isMobile }) => isMobile, "Admin showcase smoke is desktop-only");

  test("admin can create, edit, and delete a category showcase", async ({ page }) => {
    test.slow();

    const suffix = createQaSuffix();
    const showcaseTitle = `QA Showcase ${suffix}`;
    const updatedSubtitle = `Updated subtitle ${suffix}`;

    await loginAsAdmin(page);
    await goToAdminSection(page, "Showcase");

    await page.getByRole("link", { name: /add showcase/i }).click();
    await expect(page.getByRole("heading", { name: /new showcase/i })).toBeVisible();

    await uploadImageAndApplyCrop(page, page.locator('input[name="image"]'));
    await expect(page.getByRole("button", { name: /create showcase/i })).toBeEnabled({ timeout: 20000 });
    await page.getByLabel(/^title \*$/i).fill(showcaseTitle);
    await page.getByLabel(/^subtitle/i).fill(`Initial subtitle ${suffix}`);
    await page.getByLabel(/^link to category \*$/i).selectOption("/catalog?category=totes");
    await page.getByLabel(/^display position \*$/i).fill("99");
    await page.getByRole("button", { name: /create showcase/i }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard\/showcase$/);

    const showcaseCard = page.locator("div.group").filter({
      has: page.getByRole("heading", { name: showcaseTitle }),
    }).first();

    await expect(showcaseCard).toBeVisible({ timeout: 20000 });
    await showcaseCard.getByRole("link", { name: /edit/i }).click();
    await expect(page.getByRole("heading", { name: /edit showcase/i })).toBeVisible();

    await page.getByLabel(/^subtitle/i).fill(updatedSubtitle);
    await page.getByRole("button", { name: /update showcase/i }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard\/showcase$/);
    const updatedCard = page.locator("div.group").filter({
      has: page.getByRole("heading", { name: showcaseTitle }),
    }).first();

    await expect(updatedCard).toBeVisible({ timeout: 20000 });
    await expect(updatedCard).toContainText(updatedSubtitle);

    page.once("dialog", (dialog) => dialog.accept());
    await updatedCard.getByRole("button", { name: /delete/i }).click();
    await expect(page.getByRole("heading", { name: showcaseTitle })).toHaveCount(0, { timeout: 20000 });
  });
});
