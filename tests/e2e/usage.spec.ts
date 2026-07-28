import { expect, test, type Page } from "@playwright/test";

const ownerEmail = process.env.ARCATES_OWNER_EMAIL ?? "owner-qa@arcates.local";
const ownerPassword = process.env.ARCATES_OWNER_PASSWORD ?? "ArcatesQaOwner2026";
const customerEmail = process.env.ARCATES_QA_CUSTOMER_EMAIL ?? "customer-qa@arcates.local";
const customerPassword = process.env.ARCATES_QA_CUSTOMER_PASSWORD ?? "ArcatesQaCustomer2026";
const metricsToken = process.env.METRICS_TOKEN ?? "arcates-qa-metrics-token";
const qaOrigin = process.env.PLAYWRIGHT_BASE_URL ?? "https://127.0.0.1:3443";

function monitorRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}

async function login(page: Page, email: string, password: string, expectedPath: RegExp) {
  await page.goto("/giris");
  await page.getByLabel("E-posta adresi").fill(email);
  await page.getByLabel("Parola").fill(password);
  await Promise.all([
    page.waitForURL(expectedPath),
    page.getByRole("button", { name: "Giriş Yap" }).click(),
  ]);
}

async function logout(page: Page) {
  await Promise.all([
    page.waitForURL(/\/giris$/),
    page.getByRole("button", { name: /Güvenli Çıkış/ }).click(),
  ]);
}

test("public sitemap pages render without broken navigation or runtime errors", async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  const sitemapResponse = await page.request.get("/sitemap.xml");
  expect(sitemapResponse.ok()).toBeTruthy();
  const sitemap = await sitemapResponse.text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  expect(urls.length).toBeGreaterThan(10);

  const extraPublicPaths = ["/giris", "/kayit", "/parolami-unuttum", "/teklif-al"];
  const paths = new Set([
    ...urls.map((value) => new URL(value).pathname),
    ...extraPublicPaths,
  ]);

  for (const path of paths) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response, `No response for ${path}`).not.toBeNull();
    expect(response?.status(), `${path} returned an error`).toBeLessThan(400);
    await expect(page.locator("main"), `${path} must expose exactly one visible main landmark`).toBeVisible();
    expect((await page.title()).trim().length, `${path} has no document title`).toBeGreaterThan(0);
    await expectNoHorizontalOverflow(page);
  }

  expect(runtimeErrors).toEqual([]);
});

test("mobile navigation opens, closes and stays inside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const runtimeErrors = monitorRuntimeErrors(page);
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: "Menüyü aç" });
  await menuButton.click();
  await expect(page.getByRole("navigation", { name: "Mobil menü" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Web Çözümleri", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.getByRole("button", { name: "Menüyü kapat" }).click();
  await expect(page.locator(".mobile-nav")).not.toHaveClass(/mobile-nav--open/);
  expect(runtimeErrors).toEqual([]);
});

test("public APIs reject malformed, cross-site and unauthorized requests", async ({ page }) => {
  const crossSiteLead = await page.request.post("/api/leads", {
    headers: { origin: "https://attacker.invalid", "sec-fetch-site": "cross-site" },
    data: {
      name: "QA User",
      email: "cross-site-qa@arcates.local",
      description: "Bu veri kaydedilmemeli çünkü istek kaynağı güvenilir değildir.",
      consent: true,
    },
  });
  expect(crossSiteLead.status()).toBe(403);

  const invalidLead = await page.request.post("/api/leads", {
    headers: { origin: qaOrigin },
    data: { name: "Q", email: "invalid", description: "kısa", consent: false },
  });
  expect(invalidLead.status()).toBe(422);

  const unauthorizedSupport = await page.request.post("/api/support", {
    headers: { origin: qaOrigin },
    data: {
      title: "Yetkisiz destek",
      description: "Bu destek isteği giriş yapılmadan kabul edilmemelidir.",
      priority: "NORMAL",
    },
  });
  expect(unauthorizedSupport.status()).toBe(401);

  const emptyChat = await page.request.post("/api/chat", { data: { message: "" } });
  expect(emptyChat.status()).toBe(422);

  const unauthorizedMetrics = await page.request.get("/api/metrics");
  expect(unauthorizedMetrics.status()).toBe(401);
  const metrics = await page.request.get("/api/metrics", {
    headers: { authorization: `Bearer ${metricsToken}` },
  });
  expect(metrics.ok()).toBeTruthy();
  expect(await metrics.text()).toContain("arcates_up 1");
});

test("quote form creates a trackable lead", async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  const unique = Date.now();
  await page.goto("/teklif-al");
  await page.getByLabel("Ad soyad").fill("Arcates QA Lead");
  await page.getByLabel("Şirket veya marka").fill("Arcates QA");
  await page.getByLabel("E-posta adresi").fill(`lead-${unique}@arcates.local`);
  await page.getByLabel("Telefon").fill("05550000000");
  await page.getByLabel("İlgilendiğiniz çözüm").selectOption("Kurumsal web sitesi");
  await page.getByLabel("Planlanan bütçe (TL)").fill("250000");
  await page.getByLabel("Projenizi ve hedefinizi anlatın").fill(
    "Kurumsal web projesinde teklif formu, yönetim paneli ve ölçülebilir müşteri dönüşümü istiyoruz.",
  );
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Proje Talebini Gönder" }).click();
  const status = page.locator('[role="status"]');
  await expect(status).toContainText("güvenli biçimde kaydedildi");
  await expect(status).toContainText("Referans:");
  expect(runtimeErrors).toEqual([]);
});

test("registration creates an unverified account and blocks login until verification", async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  const unique = Date.now();
  const email = `registration-${unique}@arcates.local`;
  const password = "ArcatesQaRegister2026";

  await page.goto("/kayit");
  await page.getByLabel("Ad soyad").fill("Arcates QA Registration");
  await page.getByLabel("Şirket veya marka").fill(`Arcates QA ${unique}`);
  await page.getByLabel("E-posta adresi").fill(email);
  await page.getByLabel("Parola", { exact: true }).fill(password);
  await page.locator('input[name="consent"]').check();
  await Promise.all([
    page.waitForURL(/\/dogrulama-bekleniyor/),
    page.getByRole("button", { name: "Hesabı Oluştur" }).click(),
  ]);
  await expect(page.locator("main")).toContainText(/doğrulama/i);

  await page.goto("/giris");
  await page.getByLabel("E-posta adresi").fill(email);
  await page.getByLabel("Parola").fill(password);
  await page.getByRole("button", { name: "Giriş Yap" }).click();
  await expect(page.getByRole("alert")).toContainText("e-posta adresinizi doğrulamalısınız");
  await expect(page.getByRole("link", { name: /doğrulama bağlantısı/i })).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test("guest chatbot persists a reply and supports human handoff", async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Arcates asistanını aç" }).click();
  await expect(page.getByRole("region", { name: "Arcates çözüm asistanı" })).toBeVisible();
  await page.getByRole("button", { name: "Kurumsal web sitesi istiyorum" }).click();
  await expect(page.locator(".chat-message--assistant")).toHaveCount(2, { timeout: 20_000 });

  await page.getByLabel("Mesajınız").fill("Beni canlı desteğe bağlar mısınız?");
  await page.getByRole("button", { name: "Mesajı gönder" }).click();
  await expect(page.getByText("Temsilci bekleniyor")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(".chat-panel__notice")).toContainText("temsilciye iletilir");
  expect(runtimeErrors).toEqual([]);
});

test("owner can access every administration area and manage a customer project", async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  await login(page, ownerEmail, ownerPassword, /\/admin$/);
  await expect(page.getByRole("heading", { name: "Operasyon Paneli" })).toBeVisible();

  const adminPaths = [
    "/admin/musteriler",
    "/admin/talepler",
    "/admin/projeler",
    "/admin/destek",
    "/admin/konusmalar",
    "/admin/bilgi-tabani",
    "/admin/icerik",
  ];
  for (const path of adminPaths) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), `${path} failed`).toBeLessThan(400);
    await expect(page.locator("main")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }

  const unique = Date.now();
  const projectName = `QA Yönetilen Proje ${unique}`;
  const projectSlug = `qa-yonetilen-proje-${unique}`;
  await page.goto("/admin/projeler");
  await page.getByLabel("Müşteri kuruluşu").selectOption({ label: "Arcates QA Customer · 1 kullanıcı" });
  await page.getByLabel("Proje adı").fill(projectName);
  await page.getByLabel("Slug").fill(projectSlug);
  await page.getByLabel("Proje açıklaması").fill("Owner proje oluşturma ve güncelleme akışını doğrulayan tarayıcı testi.");
  await page.getByRole("button", { name: "Projeyi Oluştur" }).click();
  await expect(page.getByRole("status")).toContainText(`${projectName} projesi oluşturuldu`);

  const projectCard = page.locator("article.operation-card").filter({ hasText: projectName });
  await expect(projectCard).toBeVisible();
  await projectCard.getByLabel("Durum").selectOption("VALIDATION");
  await projectCard.getByLabel("İlerleme").fill("80");
  await projectCard.getByRole("button", { name: "Güncelle" }).click();
  await expect(page.getByRole("status")).toContainText(`${projectName} projesi güncellendi`);
  await expect(page.locator("article.operation-card").filter({ hasText: projectName })).toContainText("80%");

  await logout(page);
  expect(runtimeErrors).toEqual([]);
});

test("verified customer can view projects, create support and is denied admin access", async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  await login(page, customerEmail, customerPassword, /\/hesabim$/);
  await expect(page.getByRole("heading", { name: /Hoş geldiniz/ })).toBeVisible();
  await expect(page.getByText("Arcates QA Portal", { exact: true })).toBeVisible();

  await page.goto("/destek/destek-talebi");
  await page.getByLabel("İlgili proje").selectOption({ label: "Arcates QA Portal" });
  await page.getByLabel("Öncelik").selectOption("HIGH");
  await page.getByLabel("Kısa başlık").fill("QA müşteri destek akışı");
  await page.getByLabel("Sorunu, beklenen davranışı ve tekrar adımlarını açıklayın").fill(
    "Müşteri panelinden destek talebi oluşturulduğunda kayıt referansı görünmeli ve talep hesap özetinde listelenmelidir.",
  );
  await page.getByRole("button", { name: "Destek Talebi Oluştur" }).click();
  const status = page.locator('[role="status"]');
  await expect(status).toContainText("Destek talebiniz oluşturuldu");
  await expect(status).toContainText("Referans:");

  await page.goto("/hesabim");
  await expect(page.getByText("QA müşteri destek akışı", { exact: true })).toBeVisible();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/hesabim$/);

  await logout(page);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/giris$/);
  expect(runtimeErrors).toEqual([]);
});
