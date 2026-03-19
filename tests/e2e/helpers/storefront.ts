import { expect, type Locator, type Page } from "@playwright/test";

export async function gotoCatalog(page: Page) {
  await page.goto("/catalog");
  await page.waitForLoadState("networkidle");
  await dismissCookieConsent(page);
  await expect(page.getByRole("button", { name: /filter/i })).toBeVisible();
}

export async function openFirstProductFromCatalog(page: Page) {
  const candidateHrefs = await page.locator('main a[href^="/product/"]').evaluateAll((links) =>
    [...new Set(
      links
        .map((link) => link.getAttribute("href"))
        .filter((href): href is string => Boolean(href))
        .slice(0, 8)
    )]
  );

  for (const href of candidateHrefs) {
    await page.goto(href);
    await page.waitForLoadState("networkidle");

    if (await page.getByText(/this page could not be found/i).count()) {
      continue;
    }

    if (await productDetailAddToBagButton(page).count()) {
      await expect(productDetailAddToBagButton(page)).toBeVisible();
      return;
    }
  }

  throw new Error("Unable to find a valid product detail page from the catalog links.");
}

export async function addCurrentProductToBag(page: Page) {
  await productDetailAddToBagButton(page).click();
  await expect(page.getByText(/shopping bag \(\d+\)/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /checkout/i })).toBeVisible();
}

export async function openCatalogFilter(page: Page) {
  await page.getByRole("button", { name: /filter/i }).click();
}

export function visibleButtonByText(page: Page, text: string): Locator {
  return page.locator("button:visible", { hasText: new RegExp(`^${text}$`, "i") }).first();
}

function productDetailAddToBagButton(page: Page): Locator {
  return page.locator("[data-product-section]").getByRole("button", { name: /add to bag/i });
}

async function dismissCookieConsent(page: Page) {
  const acceptButton = page.getByRole("button", { name: /^accept$/i });

  if (await acceptButton.count()) {
    await acceptButton.click();
    await expect(acceptButton).toHaveCount(0);
  }
}
