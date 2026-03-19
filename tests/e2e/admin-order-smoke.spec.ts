import { expect, test } from "@playwright/test";
import { goToAdminSection, loginAsAdmin } from "./helpers/admin";
import { cleanupQaOrderByEmail } from "./helpers/qa-cleanup";
import { addCurrentProductToBag, gotoCatalog, openFirstProductFromCatalog } from "./helpers/storefront";

test.describe("Admin Order Smoke", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(({ isMobile }) => isMobile, "Admin order smoke is desktop-only");

  test("admin can update the status of a fresh order", async ({ page }) => {
    test.slow();

    const suffix = Date.now();
    const email = `qa-order-${suffix}@example.com`;
    const firstName = `QA${suffix}`;
    const lastName = "Buyer";
    const trackingNumber = `TRACK-${suffix}`;
    try {
      await gotoCatalog(page);
      await openFirstProductFromCatalog(page);
      await addCurrentProductToBag(page);
      await page.getByRole("link", { name: /checkout/i }).click();
      await expect(page).toHaveURL(/\/checkout/);

      await page.fill('input[name="email"]', email);
      await page.fill('input[name="firstName"]', firstName);
      await page.fill('input[name="lastName"]', lastName);
      await page.fill('input[name="address"]', "123 QA Street");
      await page.fill('input[name="city"]', "Jakarta");
      await page.fill('input[name="postalCode"]', "12345");
      await page.fill('input[name="phone"]', "08123456789");
      await page.getByRole("button", { name: /order via whatsapp/i }).click();

      await expect.poll(() => page.url(), { timeout: 30000 }).toMatch(/(wa\.me|api\.whatsapp\.com)/);

      await loginAsAdmin(page);
      await goToAdminSection(page, "Orders");

      const orderRow = page.getByRole("row").filter({ hasText: email }).first();
      await expect(orderRow).toBeVisible({ timeout: 20000 });
      const orderDetailHref = await orderRow.getByRole("link", { name: /view/i }).getAttribute("href");
      if (!orderDetailHref) {
        throw new Error(`Missing order detail link for ${email}`);
      }

      await page.goto(orderDetailHref);
      await page.waitForLoadState("networkidle");

      await expect(page.getByRole("heading", { name: /order details/i })).toBeVisible();

      await page.getByRole("combobox", { name: "Payment Status" }).click();
      await page.getByRole("option", { name: "Paid" }).click();
      await page.getByRole("combobox", { name: "Shipping Status" }).click();
      await page.getByRole("option", { name: "Shipped" }).click();
      await page.getByLabel(/tracking number/i).fill(trackingNumber);
      await page.getByRole("button", { name: /update status/i }).click();

      await expect(page.getByText(/order status updated/i)).toBeVisible({ timeout: 20000 });
      await expect(page.getByText(/^paid$/i).first()).toBeVisible();
      await expect(page.getByText(/^shipped$/i).first()).toBeVisible();
      await expect(page.getByText(trackingNumber)).toBeVisible();

      await page.goto("/admin/dashboard/orders");
      const updatedRow = page.getByRole("row").filter({ hasText: email }).first();
      await expect(updatedRow).toContainText("paid");
      await expect(updatedRow).toContainText("shipped");
    } finally {
      await cleanupQaOrderByEmail(email);
    }
  });
});
