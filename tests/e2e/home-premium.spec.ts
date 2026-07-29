import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}

test("premium homepage remains stable from 360 to 1920 pixels", async ({ page }) => {
  const viewports = [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 430, height: 860 },
    { width: 768, height: 900 },
    { width: 1024, height: 900 },
    { width: 1280, height: 900 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main.home-v2")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const containerWidth = await page.locator(".premium-hero .container").evaluate((element) => element.getBoundingClientRect().width);
    expect(containerWidth).toBeLessThanOrEqual(Math.min(viewport.width, 1362));
  }
});

test("reference fidelity keeps the desktop homepage compact and visually dense", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });

  const hero = await page.locator(".premium-hero").boundingBox();
  const heroVisual = await page.locator(".hero-system--premium").boundingBox();
  const serviceCard = await page.locator(".premium-service-card").first().boundingBox();
  const sectionPadding = await page.locator("#services").evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingTop));
  const footerMargin = await page.locator(".site-footer").evaluate((element) => Number.parseFloat(getComputedStyle(element).marginTop));

  expect(hero).not.toBeNull();
  expect(hero!.height).toBeGreaterThanOrEqual(620);
  expect(hero!.height).toBeLessThanOrEqual(750);
  expect(heroVisual).not.toBeNull();
  expect(heroVisual!.width).toBeGreaterThan(560);
  expect(serviceCard).not.toBeNull();
  expect(serviceCard!.height).toBeGreaterThanOrEqual(195);
  expect(serviceCard!.height).toBeLessThanOrEqual(230);
  expect(sectionPadding).toBeLessThanOrEqual(80);
  expect(footerMargin).toBe(0);
  await expectNoHorizontalOverflow(page);
});

test("premium accordions keep one item open and expose correct ARIA state", async ({ page }) => {
  await page.goto("/#discovery");
  const panel = page.locator(".premium-discovery__panel .premium-accordion");
  const buttons = panel.getByRole("button");
  await expect(buttons).toHaveCount(5);
  await expect(buttons.nth(0)).toHaveAttribute("aria-expanded", "true");

  await buttons.nth(1).click();
  await expect(buttons.nth(0)).toHaveAttribute("aria-expanded", "false");
  await expect(buttons.nth(1)).toHaveAttribute("aria-expanded", "true");
  await expect(panel.locator(".premium-accordion__panel").nth(0)).toHaveAttribute("aria-hidden", "true");
  await expect(panel.locator(".premium-accordion__panel").nth(1)).toHaveAttribute("aria-hidden", "false");
});

test("desktop anchor navigation reaches the correct homepage sections", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("link", { name: "Projeler", exact: true }).click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.locator("#projects")).toBeInViewport({ ratio: 0.2 });

  await page.getByRole("link", { name: "Süreç", exact: true }).click();
  await expect(page).toHaveURL(/#process$/);
  await expect(page.locator("#process")).toBeInViewport({ ratio: 0.2 });
});

test("reduced motion disables continuous homepage animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".premium-hero .reveal").first()).toHaveClass(/is-visible/);

  const animationName = await page.locator(".hero-system__orbit").first().evaluate((element) => getComputedStyle(element).animationName);
  expect(animationName).toBe("none");
  await expect(page.locator(".hero-system__signal").first()).toBeHidden();
});

test("animated metrics settle once and retain stable formatted values", async ({ page }) => {
  await page.goto("/");
  const metrics = page.locator(".premium-metrics");
  await metrics.scrollIntoViewIfNeeded();
  const counters = metrics.locator(".animated-counter > span");
  const expectedValues = ["0.9 sn", "92+", "%35+", "%98+", "%99.9"];
  await expect(counters).toHaveCount(expectedValues.length);

  for (const [index, value] of expectedValues.entries()) {
    await expect(counters.nth(index)).toHaveText(value, { timeout: 5_000 });
  }

  await page.locator("#services").scrollIntoViewIfNeeded();
  await metrics.scrollIntoViewIfNeeded();
  expect(await counters.allTextContents()).toEqual(expectedValues);
});

test("capture deterministic desktop and mobile homepage review images", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("main.home-v2")).toBeVisible();
  await page.screenshot({ path: "test-results/playwright/arcates-home-desktop.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("main.home-v2")).toBeVisible();
  await page.screenshot({ path: "test-results/playwright/arcates-home-mobile.png", fullPage: true });
});
