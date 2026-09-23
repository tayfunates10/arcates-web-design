import { expect, test, type Page } from "@playwright/test";

const customerEmail = process.env.ARCATES_QA_CUSTOMER_EMAIL;
const customerPassword = process.env.ARCATES_QA_CUSTOMER_PASSWORD;

async function login(page: Page, email: string, password: string) {
  await page.goto("/giris", { waitUntil: "networkidle" });
  await page.getByLabel("E-posta adresi").fill(email);
  await page.getByLabel("Parola").fill(password);
  await Promise.all([
    page.waitForURL(/\/hesabim$/),
    page.getByRole("button", { name: "Giriş Yap" }).click(),
  ]);
}

test("mobile request forms are not covered by the floating chat launcher", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/teklif-al", { waitUntil: "networkidle" });
  await expect(page.locator(".request-layout")).toBeVisible();
  await expect(page.locator(".chat-widget")).toBeHidden();
  await expect(page.getByRole("button", { name: "Proje Talebini Gönder" })).toBeVisible();

  test.skip(!customerEmail || !customerPassword, "QA customer credentials are required for support form coverage");
  await login(page, customerEmail!, customerPassword!);
  await page.goto("/destek/destek-talebi", { waitUntil: "networkidle" });
  await expect(page.locator(".request-layout")).toBeVisible();
  await expect(page.locator(".chat-widget")).toBeHidden();
  await expect(page.getByRole("button", { name: "Destek Talebi Oluştur" })).toBeVisible();
});
