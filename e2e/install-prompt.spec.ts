import { test, expect, type Page } from "@playwright/test";
import { collectPageErrors, stubBackend } from "./support/backend";

/**
 * The install banner, in a real browser against a real build.
 *
 * The jsdom tests own the show/hide rules. This checks what they cannot: that
 * the banner is actually mounted in the app, that the built page links its
 * manifest, and that a dismissal survives a real reload.
 *
 * Chrome only fires `beforeinstallprompt` for a real install-eligible site
 * (and service workers are blocked in this suite), so the event is sent by
 * hand, shaped like Chrome's.
 */

const ANDROID =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
const HEADLINE = "Get Milk Me Not on your home screen";

test.use({ userAgent: ANDROID });

const offerInstall = (page: Page) =>
  page.evaluate(() => {
    const event = new Event("beforeinstallprompt", { cancelable: true });
    Object.assign(event, {
      prompt: () => Promise.resolve(),
      userChoice: Promise.resolve({ outcome: "dismissed" }),
    });
    window.dispatchEvent(event);
  });

test.describe("install banner", () => {
  test("the page links a manifest with the app's permanent identity", async ({ page }) => {
    await stubBackend(page);
    await page.goto("/");
    const href = await page.locator("link[rel='manifest']").getAttribute("href");
    expect(href).toBe("/manifest.webmanifest");
    const manifest = await (await page.request.get(href!)).json();
    expect(manifest.id).toBe("/");
    expect(manifest.name).toBe("Milk Me Not");
  });

  test("an Android visitor is offered the install, and × keeps it away", async ({ page }) => {
    const errors = collectPageErrors(page);
    await stubBackend(page);
    await page.goto("/");

    await offerInstall(page);
    await expect(page.getByText(HEADLINE)).toBeVisible();
    await page.getByRole("button", { name: "Don't show again" }).click();
    await expect(page.getByText(HEADLINE)).toHaveCount(0);

    await page.reload();
    await offerInstall(page);
    await expect(page.getByRole("heading").first()).toBeVisible();
    await expect(page.getByText(HEADLINE)).toHaveCount(0);

    expect(errors).toEqual([]);
  });
});
