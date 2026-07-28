import { mkdir } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const ownerEmail = process.env.ARCATES_OWNER_EMAIL ?? "owner-qa@arcates.local";
const ownerPassword = process.env.ARCATES_OWNER_PASSWORD ?? "ArcatesQaOwner2026";
const customerEmail = process.env.ARCATES_QA_CUSTOMER_EMAIL ?? "customer-qa@arcates.local";
const customerPassword = process.env.ARCATES_QA_CUSTOMER_PASSWORD ?? "ArcatesQaCustomer2026";
const outputDir = "test-results/playwright/ui-screenshots";

async function login(page: Page, email: string, password: string, expectedPath: RegExp) {
  await page.goto("/giris");
  await page.getByLabel("E-posta adresi").fill(email);
  await page.getByLabel("Parola").fill(password);
  await Promise.all([
    page.waitForURL(expectedPath),
    page.getByRole("button", { name: "Giriş Yap" }).click(),
  ]);
}

async function capture(page: Page, fileName: string) {
  await page.screenshot({ path: `${outputDir}/${fileName}`, fullPage: true });
}

test("capture Arcates interface gallery", async ({ page }) => {
  test.setTimeout(120_000);
  await mkdir(outputDir, { recursive: true });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();
  await capture(page, "01-home-desktop.png");

  await page.getByRole("button", { name: "Arcates asistanını aç" }).click();
  await expect(page.getByRole("region", { name: "Arcates çözüm asistanı" })).toBeVisible();
  await capture(page, "02-home-chat-open.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  await expect(page.getByRole("navigation", { name: "Mobil menü" })).toBeVisible();
  await capture(page, "03-home-mobile-menu.png");

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/teklif-al");
  await expect(page.getByRole("button", { name: "Proje Talebini Gönder" })).toBeVisible();
  await capture(page, "04-quote-form.png");

  await page.goto("/giris");
  await expect(page.getByRole("button", { name: "Giriş Yap" })).toBeVisible();
  await capture(page, "05-login.png");

  await login(page, customerEmail, customerPassword, /\/hesabim$/);
  await expect(page.getByRole("heading", { name: /Hoş geldiniz/ })).toBeVisible();
  await capture(page, "06-customer-dashboard.png");

  await page.context().clearCookies();
  await login(page, ownerEmail, ownerPassword, /\/admin$/);
  await expect(page.getByRole("heading", { name: "Operasyon Paneli" })).toBeVisible();
  await capture(page, "07-admin-dashboard.png");

  await page.goto("/admin/projeler");
  await expect(page.getByRole("heading", { name: /Projeler/i })).toBeVisible();
  await capture(page, "08-admin-projects.png");
});
