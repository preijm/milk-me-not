import { test, expect } from "@playwright/test";
import { collectPageErrors, stubBackend } from "./support/backend";

/**
 * The brand pages, in a real browser against a real build.
 *
 * The jsdom tests already assert what these pages say. What they cannot see is
 * whether the routes are wired into `App.tsx` at all, whether a lazy chunk
 * resolves, and whether the link out of Results actually goes anywhere — three
 * different failures that all look like "the page is blank" and none of which
 * a render test can reach.
 */

const rating = (brand: string, product: string, id: string, score: number) => ({
  product_id: id,
  brand_name: brand,
  product_name: product,
  rating: score,
  is_barista: false,
  price_quality_ratio: null,
  property_names: null,
  flavor_names: null,
  created_at: "2026-08-01T00:00:00Z",
  country_code: "NL",
});

const fixtures = {
  rpc: {
    get_aggregated_milk_tests: [
      rating("Alpro", "Oat", "a1", 8),
      rating("Alpro", "Oat", "a1", 6),
      rating("Alpro", "Soya", "a2", 9),
      rating("Wunda", "Original", "w1", 7),
      rating("Harvest Moon", "Oat", "h1", 9),
    ],
  },
};

test.describe("brand pages", () => {
  test("the index lists brands and flags the one that has stopped", async ({ page }) => {
    const errors = collectPageErrors(page);
    await stubBackend(page, fixtures);

    await page.goto("/brands");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("brands");
    const wunda = page.locator("a[href='/brand/wunda']");
    await expect(wunda).toContainText("Wunda");
    await expect(wunda).toContainText("Discontinued");

    // The rule the whole design rests on: an unchecked brand claims nothing.
    const unchecked = page.locator("a[href='/brand/harvest-moon']");
    await expect(unchecked).toContainText("Harvest Moon");
    await expect(unchecked).not.toContainText("Still listed");

    expect(errors).toEqual([]);
  });

  test("a discontinued brand says so, with when and on whose word", async ({ page }) => {
    const errors = collectPageErrors(page);
    await stubBackend(page, fixtures);

    await page.goto("/brands");
    await page.locator("a[href='/brand/wunda']").click();

    await expect(page).toHaveURL(/\/brand\/wunda$/);
    await expect(page.getByText(/cannot buy this any more/i)).toBeVisible();
    await expect(page.getByText(/October 2024/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Source" })).toBeVisible();
    await expect(page.getByText("Original")).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("a brand nobody has checked gets no verdict either way", async ({ page }) => {
    const errors = collectPageErrors(page);
    await stubBackend(page, fixtures);

    await page.goto("/brand/harvest-moon");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Harvest Moon");
    await expect(page.getByText(/cannot buy this any more/i)).toHaveCount(0);
    // Said in a sentence rather than a "Not checked" pill, which described our
    // filing rather than the drink and left a reader guessing at what it meant.
    await expect(page.getByText(/do not know whether this is still on sale/i)).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("an address matching no brand says so rather than rendering empty", async ({ page }) => {
    await stubBackend(page, fixtures);
    await page.goto("/brand/nothing-here");
    await expect(page.getByText(/No brand by that name/i)).toBeVisible();
  });
});
