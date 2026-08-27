import { test, expect } from "@playwright/test";
import { collectPageErrors, signIn, stubBackend } from "./support/backend";

/**
 * Posting a rating, by driving the form rather than calling the hook.
 *
 * `useMilkTestForm` is well covered by unit tests, and all of them call
 * `handleSubmit` directly. That answers "would a bad rating be rejected" and
 * says nothing at all about whether the button is wired to it, whether the
 * country picker sets the country, or whether a reader can reach the end of
 * the form. Those are different failures with the same symptom — nothing is
 * saved — and only one of them is visible from jsdom.
 *
 * Every request is intercepted, so this fills in the real form, presses the
 * real button, and reads what the app tried to write instead of writing it.
 */

const PRODUCT = {
  id: "prod-1",
  brand_id: "brand-1",
  brand_name: "Alpro",
  product_name: "Oat",
  product_name_id: "name-1",
  is_barista: false,
  property_names: null,
  flavor_names: null,
};

const fixtures = {
  rpc: { search_product_types: [PRODUCT] },
  tables: {
    product_search_view: [PRODUCT],
    countries: [
      { name: "Netherlands", code: "NL" },
      { name: "Belgium", code: "BE" },
    ],
  },
};

const pickProduct = async (page: import("@playwright/test").Page) => {
  await page.getByPlaceholder("Search for product...").fill("Alpro");
  await page.getByText("Alpro", { exact: true }).first().click();
};

const pickCountry = async (page: import("@playwright/test").Page) => {
  await page.getByPlaceholder("Enter country name...").fill("Neth");
  await page.getByText("Netherlands", { exact: true }).first().click();
};

const setScore = (page: import("@playwright/test").Page, score: string) =>
  page.getByLabel("Score out of 10").fill(score);

test.describe("posting a rating", () => {
  test("saves what the reader filled in", async ({ page }) => {
    const errors = collectPageErrors(page);
    const backend = await stubBackend(page, fixtures);
    await signIn(page);

    await page.goto("/add");
    await pickProduct(page);
    await setScore(page, "8");
    await pickCountry(page);

    const submit = page.getByRole("button", { name: "Post my rating" });
    await expect(submit).toBeEnabled();
    await submit.click();

    // The row the app tried to insert, rather than a toast saying it did.
    await expect
      .poll(() => backend.writes.filter((w) => w.path === "milk_tests").length, { timeout: 15_000 })
      .toBe(1);

    const written = backend.writes.find((w) => w.path === "milk_tests");
    expect(written?.method).toBe("POST");
    expect(written?.body).toMatchObject({
      product_id: "prod-1",
      rating: 8,
      country_code: "NL",
    });

    expect(errors).toEqual([]);
  });

  test("will not post without a country, however complete it looks", async ({ page }) => {
    // The unit tests prove the hook refuses this. What they cannot show is
    // that the button is still reachable and pressable at that moment, which
    // is where a reader would actually be standing.
    const backend = await stubBackend(page, fixtures);
    await signIn(page);

    await page.goto("/add");
    await pickProduct(page);
    await setScore(page, "8");

    await expect(page.getByRole("button", { name: "Post my rating" })).toBeDisabled();
    expect(backend.writes.filter((w) => w.path === "milk_tests")).toHaveLength(0);
  });

  test("carries the tasting note and the shop through to the row", async ({ page }) => {
    const backend = await stubBackend(page, fixtures);
    await signIn(page);

    await page.goto("/add");
    await pickProduct(page);
    await setScore(page, "7");
    await page.getByPlaceholder("Tasting notes...").fill("Creamy, barely oaty");
    await pickCountry(page);
    await page.getByPlaceholder("Search or add shop...").fill("Albert Heijn");
    await page.getByText(/Albert Heijn/).first().click();

    await page.getByRole("button", { name: "Post my rating" }).click();

    await expect
      .poll(() => backend.writes.find((w) => w.path === "milk_tests")?.body, { timeout: 15_000 })
      .toMatchObject({ rating: 7, notes: "Creamy, barely oaty", shop_name: "Albert Heijn" });
  });

  test("keeps a shop the reader typed but never picked from the list", async ({ page }) => {
    // Shop is optional, so nothing blocked a submit — the name sat in the box
    // looking entered and the rating saved without it. Typing is choosing now.
    const backend = await stubBackend(page, fixtures);
    await signIn(page);

    await page.goto("/add");
    await pickProduct(page);
    await setScore(page, "6");
    await pickCountry(page);

    await page.getByPlaceholder("Search or add shop...").fill("Jumbo");
    // Deliberately no click on the suggestion, and focus moved away the way
    // reaching for the button does.
    await page.getByPlaceholder("Tasting notes...").click();

    await page.getByRole("button", { name: "Post my rating" }).click();

    await expect
      .poll(() => backend.writes.find((w) => w.path === "milk_tests")?.body, { timeout: 15_000 })
      .toMatchObject({ shop_name: "Jumbo" });
  });

  test("does not post twice when the button is pressed twice", async ({ page }) => {
    // A double tap on a phone is one intention, not two ratings.
    const backend = await stubBackend(page, fixtures);
    await signIn(page);

    await page.goto("/add");
    await pickProduct(page);
    await setScore(page, "5");
    await pickCountry(page);

    const submit = page.getByRole("button", { name: "Post my rating" });
    await submit.dblclick();

    await page.waitForTimeout(2500);
    expect(backend.writes.filter((w) => w.path === "milk_tests")).toHaveLength(1);
  });
});
