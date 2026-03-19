import { expect, test } from "@playwright/test";
import { createQaSuffix, goToAdminSection, loginAsAdmin, productRow, uploadImageAndApplyCrop } from "./helpers/admin";

test.describe("Admin Product Smoke", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(({ isMobile }) => isMobile, "Admin product smoke is desktop-only");

  test("admin can create, archive, restore, and delete a product", async ({ page }) => {
    test.slow();

    const suffix = createQaSuffix();
    const baseName = `QA Product ${suffix}`;
    const initialSku = `QA-${suffix}`;

    await loginAsAdmin(page);
    await goToAdminSection(page, "Products");

    await page.getByRole("link", { name: /add product/i }).click();
    await expect(page.getByRole("heading", { name: /create new product/i })).toBeVisible();

    await page.getByLabel(/model name/i).fill(baseName);

    const colorButton = page.locator("button[title]").first();
    const colorName = await colorButton.getAttribute("title");
    if (!colorName) {
      throw new Error("Expected at least one color option for product smoke test.");
    }

    await colorButton.click();
    await expect(page.getByText(`${baseName} ${colorName}`)).toBeVisible();

    await page.getByLabel(/sku/i).fill(initialSku);
    await page.getByLabel(/dimensions/i).fill("40 cm x 28 cm");
    await page.getByLabel(/category/i).selectOption("Totes");
    await page.getByLabel(/price/i).fill("1500000");
    await page.getByLabel(/available stock/i).fill("4");
    await page.getByLabel(/product description/i).fill(`QA product description ${suffix}`);

    await uploadImageAndApplyCrop(page, page.locator('input[type="file"]').last());
    await expect(page.getByText(/primary image/i)).toBeVisible();

    const productName = `${baseName} ${colorName}`;

    await page.getByRole("button", { name: /create product/i }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard\/products$/);

    const createdRow = productRow(page, productName);
    await expect(createdRow).toBeVisible({ timeout: 20000 });
    await expect(createdRow).toContainText(initialSku);

    await createdRow.getByLabel(`Archive product: ${productName}`).click();
    await expect(productRow(page, productName)).toHaveCount(0, { timeout: 20000 });
    await page.waitForTimeout(600);

    await page.getByRole("button", { name: /archived/i }).click();
    await page.waitForTimeout(600);
    await page.getByPlaceholder(/search products/i).fill(productName);
    const archivedRow = productRow(page, productName);
    await expect(archivedRow).toBeVisible({ timeout: 20000 });

    await archivedRow.getByLabel(`Restore product: ${productName}`).click();
    await expect(productRow(page, productName)).toHaveCount(0, { timeout: 20000 });
    await page.waitForTimeout(600);

    await page.getByRole("button", { name: /^active/i }).click();
    await page.waitForTimeout(600);
    await page.getByPlaceholder(/search products/i).fill(productName);
    const restoredRow = productRow(page, productName);
    await expect(restoredRow).toBeVisible({ timeout: 20000 });

    await restoredRow.getByLabel(`Delete product: ${productName}`).click();
    await expect(productRow(page, productName)).toHaveCount(0, { timeout: 20000 });
  });
});
