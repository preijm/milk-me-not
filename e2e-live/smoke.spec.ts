import { test, expect, type Page } from "@playwright/test";

/**
 * Does the live site actually run, in a real browser?
 *
 * The health check downloads the HTML and `version.json`, which proves the
 * right files are being served and nothing more. It cannot see the failure that
 * matters most: a bundle that loads and then throws. That has happened here — a
 * version string arrived as `undefined`, got split, and the whole page rendered
 * nothing while every check stayed green.
 *
 * So this opens the real site and looks. Read-only by construction: no sign-in,
 * no form, no write. It never asks the backend for anything a visitor's browser
 * would not.
 */

/** Same-origin script or stylesheet that failed — a deploy that left a chunk behind. */
const isOwnAsset = (url: string, base: string) =>
  url.startsWith(base) && /\.(js|css)(\?|$)/.test(url);

/**
 * Open a page and collect everything that says it is broken.
 *
 * `pageerror` is an uncaught throw; the boundary's alert is a render crash React
 * caught; an empty `#root` is the blank page. A missing chunk is listed too,
 * because it shows up as a lazy route that never arrives.
 */
const visit = async (page: Page, path: string) => {
  const problems: string[] = [];
  const base = new URL(test.info().project.use.baseURL!).origin;

  page.on("pageerror", (err) => problems.push(`uncaught: ${err.message}`));
  page.on("response", (res) => {
    if (res.status() >= 400 && isOwnAsset(res.url(), base)) {
      problems.push(`asset ${res.status()}: ${res.url()}`);
    }
  });

  await page.goto(path, { waitUntil: "load" });

  // Lazy routes arrive after `load`; wait until React has put something on the
  // page rather than guessing a delay.
  await page
    .waitForFunction(() => (document.getElementById("root")?.children.length ?? 0) > 0, null, {
      timeout: 20_000,
    })
    .catch(() => problems.push("#root is still empty: the page rendered nothing"));

  // Long enough for a throw in an effect or a lazy chunk to land, without
  // waiting on map tiles or the feed's images, which never go quiet.
  await page.waitForTimeout(2_000);

  if (await page.getByText("This page stopped working.").isVisible()) {
    const detail = await page.locator("details pre").first().textContent().catch(() => "");
    problems.push(`error page shown: ${detail?.trim() || "(no message)"}`);
  }

  return problems;
};

test.beforeEach(async ({ context }) => {
  // Opt this browser out of Counterscale before any page script runs, so a
  // smoke test every deploy and every six hours does not land in the real
  // visitor numbers. Same key `?notrack=1` writes, without the toast.
  await context.addInitScript(() => {
    try {
      localStorage.setItem("pco-notrack", "1");
    } catch {
      // Storage blocked: nothing to opt out of either.
    }
  });
});

for (const path of ["/", "/results", "/brands", "/about"]) {
  test(`${path} renders without breaking`, async ({ page }) => {
    expect(await visit(page, path)).toEqual([]);
  });
}

test("a product page renders without breaking", async ({ page }) => {
  // Found from the brands list rather than hardcoded, so a deleted product
  // cannot turn this red. A brand page links its products.
  await page.goto("/brands", { waitUntil: "load" });
  const brand = page.locator('a[href^="/brand/"]').first();
  await expect(brand, "the brands page lists no brands").toBeVisible({ timeout: 20_000 });
  const brandHref = await brand.getAttribute("href");

  await page.goto(brandHref!, { waitUntil: "load" });
  const product = page.locator('a[href^="/product/"]').first();
  await expect(product, `${brandHref} links no products`).toBeAttached({ timeout: 20_000 });
  const productHref = await product.getAttribute("href");

  expect(await visit(page, productHref!)).toEqual([]);
});
