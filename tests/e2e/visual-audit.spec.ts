import { expect, test, type Page } from "@playwright/test";

const ownerEmail = process.env.ARCATES_OWNER_EMAIL ?? "owner-qa@arcates.local";
const ownerPassword = process.env.ARCATES_OWNER_PASSWORD ?? "ArcatesQaOwner2026";
const customerEmail = process.env.ARCATES_QA_CUSTOMER_EMAIL ?? "customer-qa@arcates.local";
const customerPassword = process.env.ARCATES_QA_CUSTOMER_PASSWORD ?? "ArcatesQaCustomer2026";

const publicPaths = [
  "/",
  "/web-cozumleri",
  "/web-cozumleri/kurumsal-web-tasarim",
  "/projelerimiz",
  "/projelerimiz/nexora-agentos",
  "/hakkimizda",
  "/nasil-calisiyoruz",
  "/teknolojiler",
  "/blog",
  "/blog/kurumsal-web-sitesi-planlama",
  "/sss",
  "/destek",
  "/iletisim",
  "/teklif-al",
  "/giris",
  "/kayit",
  "/parolami-unuttum",
] as const;

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
] as const;

function screenshotName(path: string, viewport: string) {
  const slug = path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "--");
  return `test-results/playwright/visual-${slug}-${viewport}.png`;
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect.poll(async () =>
    page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
}

async function capture(page: Page, path: string, viewport: (typeof viewports)[number]) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  const response = await page.goto(path, { waitUntil: "networkidle" });
  expect(response, `No response for ${path}`).not.toBeNull();
  expect(response?.status(), `${path} returned an error`).toBeLessThan(400);
  await expect(page.locator("main")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: screenshotName(path, viewport.name), fullPage: true });
}

async function login(page: Page, email: string, password: string, expectedPath: RegExp) {
  await page.goto("/giris", { waitUntil: "networkidle" });
  await page.getByLabel("E-posta adresi").fill(email);
  await page.getByLabel("Parola").fill(password);
  await Promise.all([
    page.waitForURL(expectedPath),
    page.getByRole("button", { name: "Giriş Yap" }).click(),
  ]);
}

test("capture representative public screens for real visual review", async ({ page }) => {
  test.setTimeout(240_000);
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const viewport of viewports) {
    for (const path of publicPaths) {
      await capture(page, path, viewport);
    }
  }
});

test("capture authenticated customer and admin screens for real visual review", async ({ page }) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: "reduce" });

  await login(page, ownerEmail, ownerPassword, /\/admin$/);
  for (const viewport of viewports) {
    for (const path of ["/admin", "/admin/projeler", "/admin/konusmalar"]) {
      await capture(page, path, viewport);
    }
  }

  await page.context().clearCookies();
  await login(page, customerEmail, customerPassword, /\/hesabim$/);
  for (const viewport of viewports) {
    for (const path of ["/hesabim", "/destek/destek-talebi"]) {
      await capture(page, path, viewport);
    }
  }
});


test("mobile auth forms keep chat launcher out of form controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/kayit", { waitUntil: "networkidle" });

  await expect(page.locator(".chat-widget")).toBeHidden();
  await expect(page.getByRole("checkbox")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
