import { expect, test } from "@playwright/test";

const ownerEmail = process.env.ARCATES_OWNER_EMAIL;
const ownerPassword = process.env.ARCATES_OWNER_PASSWORD;
const customerEmail = process.env.ARCATES_QA_CUSTOMER_EMAIL;
const customerPassword = process.env.ARCATES_QA_CUSTOMER_PASSWORD;

async function login(page: import("@playwright/test").Page, email: string, password: string, expectedPath: RegExp) {
  await page.goto("/giris", { waitUntil: "networkidle" });
  await page.getByLabel("E-posta adresi").fill(email);
  await page.getByLabel("Parola").fill(password);
  await Promise.all([
    page.waitForURL(expectedPath),
    page.getByRole("button", { name: "Giriş Yap" }).click(),
  ]);
}

test("mobile authenticated portals do not float chat over dashboard content", async ({ page }) => {
  test.skip(!ownerEmail || !ownerPassword || !customerEmail || !customerPassword, "QA credentials are required");
  await page.setViewportSize({ width: 390, height: 844 });

  await login(page, ownerEmail!, ownerPassword!, /\/admin$/);
  await expect(page.locator(".portal-shell")).toBeVisible();
  await expect(page.locator(".chat-widget")).toBeHidden();

  await page.context().clearCookies();
  await login(page, customerEmail!, customerPassword!, /\/hesabim$/);
  await expect(page.locator(".portal-shell")).toBeVisible();
  await expect(page.locator(".chat-widget")).toBeHidden();
});
