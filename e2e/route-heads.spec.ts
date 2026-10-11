import { test, expect } from "@playwright/test";
import { stubBackend } from "./support/backend";

/**
 * The file a crawler is handed for a fixed route, before and after React.
 *
 * The unit test proves the build can stamp a head. It cannot prove the stamped
 * file is the one served at `/about`, or that the page ends up with one
 * canonical rather than the build's and React's side by side.
 */
test.describe("route heads", () => {
  test("a fixed route is served its own head, with no script run", async ({ request }) => {
    const html = await (await request.get("/about")).text();

    expect(html).toContain('<link rel="canonical" href="https://milkmenot.com/about" />');
    expect(html).toContain("<title>It started with soy sauce");
  });

  test("a route with no file still gets the bare shell, claiming no address", async ({ request }) => {
    const html = await (await request.get("/product/anything")).text();

    // With `href`: the history patch's own comment quotes the bare tag.
    expect(html).not.toContain('<link rel="canonical" href=');
  });

  test("once the app is up there is one canonical, not two", async ({ page }) => {
    await stubBackend(page, {});
    await page.goto("/about");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const canonical = page.locator('head link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    await expect(canonical).toHaveAttribute("href", "https://milkmenot.com/about");
  });
});
