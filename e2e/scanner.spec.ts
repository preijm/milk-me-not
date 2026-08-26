import { test, expect } from "@playwright/test";
import { collectPageErrors, signIn, stubBackend } from "./support/backend";

/**
 * The scanner, in a browser that actually has a camera.
 *
 * This is the reason for the whole Playwright setup. Opening the scanner needs
 * `getUserMedia` to resolve, a `<video>` element to carry a real stream, and
 * either the platform's `BarcodeDetector` or a canvas to read frames from.
 * jsdom has none of those, so no unit test can tell the difference between a
 * scanner that works and one that reports "No camera access" — which is
 * precisely the failure that took a morning to diagnose.
 *
 * Chromium is started with a synthetic camera, so this asserts the code path
 * up to and including a live stream. What it cannot assert is decoding a real
 * barcode: the fake device produces a rolling test pattern, not a carton.
 */
test.describe("the scanner", () => {
  test.beforeEach(async ({ page }) => {
    await stubBackend(page);
    await signIn(page);
  });

  test("opens from the member bar and reaches a live camera", async ({ page }) => {
    const errors = collectPageErrors(page);

    await page.goto("/");
    await page.getByRole("button", { name: "Scan" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Scan the carton")).toBeVisible();

    // The important assertion. "Waking the camera…" is the starting state and
    // resolves either into scanning or into one of the refusals, and the
    // refusals are what a broken camera looks like.
    await expect(dialog.getByText(/Point it at the barcode/i)).toBeVisible({ timeout: 15_000 });

    expect(errors).toEqual([]);
  });

  test("does not report a camera problem when the camera is fine", async ({ page }) => {
    // Stated separately from the happy path because these are the exact
    // strings a reader sees when scanning is broken, and a regression that
    // swaps one for the other would still leave a visible dialog.
    await page.goto("/");
    await page.getByRole("button", { name: "Scan" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/Point it at the barcode/i)).toBeVisible({ timeout: 15_000 });

    await expect(dialog.getByText(/camera was refused/i)).toHaveCount(0);
    await expect(dialog.getByText(/No camera found/i)).toHaveCount(0);
    await expect(dialog.getByText(/cannot open a camera/i)).toHaveCount(0);
    await expect(dialog.getByText(/sending nothing/i)).toHaveCount(0);
  });

  test("puts a picture on the screen rather than a black rectangle", async ({ page }) => {
    // The stream can be granted and still arrive empty — the `blank` state
    // exists because that has happened. A video with no dimensions is the
    // difference between "the camera is on" and "the camera is working".
    await page.goto("/");
    await page.getByRole("button", { name: "Scan" }).click();

    const video = page.getByRole("dialog").locator("video");
    await expect(video).toBeVisible();

    await expect
      .poll(async () => video.evaluate((el: HTMLVideoElement) => el.videoWidth), {
        timeout: 15_000,
      })
      .toBeGreaterThan(0);
  });

  test("gives the camera back when the reader closes it", async ({ page }) => {
    // A stream left running holds the camera and lights the indicator on a
    // phone long after the dialog has gone.
    await page.goto("/");
    await page.getByRole("button", { name: "Scan" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.locator("video")).toBeVisible();

    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();

    // No API exposes another component's media tracks from the outside, so
    // this asserts the thing that does release them here: the element is gone.
    await expect(page.locator("video")).toHaveCount(0);
  });
});
