import path from "node:path";
import { expect, type Locator, type Page } from "@playwright/test";

const defaultAdminEmail = "admin@moema.com";
const defaultAdminPassword = "password123";
const placeholderImagePath = path.resolve(process.cwd(), "public/placeholder-bag.jpg");

function getAdminCredentials() {
  return {
    email: process.env.PLAYWRIGHT_ADMIN_EMAIL || defaultAdminEmail,
    password: process.env.PLAYWRIGHT_ADMIN_PASSWORD || defaultAdminPassword,
  };
}

export async function loginAsAdmin(page: Page) {
  const { email, password } = getAdminCredentials();

  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: /admin atelier/i })).toBeVisible();

  await page.getByLabel(/email address/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page.getByText(/moema admin workspace/i)).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole("heading", { name: /dashboard overview/i })).toBeVisible({ timeout: 20000 });
  await dismissCookieConsent(page);
}

export async function goToAdminSection(page: Page, name: "Products" | "Colors" | "Showcase" | "Orders" | "Overview") {
  await page.getByRole("link", { name }).click();
  await page.waitForLoadState("networkidle");
}

export function createQaSuffix() {
  return `${Date.now()}`;
}

export function getPlaceholderImagePath() {
  return placeholderImagePath;
}

export function productRow(page: Page, productName: string): Locator {
  return page.getByRole("row").filter({ hasText: productName }).first();
}

export async function uploadImageAndApplyCrop(page: Page, input: Locator) {
  await input.setInputFiles(placeholderImagePath);

  const applyCropButton = page.getByRole("button", { name: /terapkan/i });
  if (await applyCropButton.count()) {
    await expect(applyCropButton).toBeVisible();
    await applyCropButton.click();
    await expect
      .poll(async () => (await applyCropButton.count()) === 0 || (await page.getByRole("button", { name: /processing/i }).count()) > 0)
      .toBe(true);
  }

  await expect
    .poll(async () => {
      if (await page.getByRole("button", { name: /processing/i }).count()) {
        return false;
      }

      return (await page.getByText(/primary image/i).count()) > 0
        || (await page.getByText(/ganti gambar/i).count()) > 0
        || (await page.getByText(/crop ulang/i).count()) > 0;
    })
    .toBe(true);
}

async function dismissCookieConsent(page: Page) {
  const acceptButton = page.getByRole("button", { name: /^accept$/i });

  if (await acceptButton.count()) {
    await acceptButton.click();
    await expect(acceptButton).toHaveCount(0);
  }
}
