import type { Page } from "@playwright/test";

/**
 * Answer every outbound request from a fixture, so nothing here depends on
 * production.
 *
 * The alternative is pointing these at the live Supabase project, which fails
 * in two directions at once: the assertions drift as real people add ratings,
 * and any test that submitted anything would be writing to the board other
 * people read. A browser test that mutates production is not a test, it is a
 * user.
 *
 * Everything unmatched is fulfilled empty rather than allowed through, so a
 * new call added to the app shows up as a page that renders nothing rather
 * than as a silent request to a real server.
 */

const PROJECT_REF = "jtabjndnietpewvknjrm";

/**
 * A session the app will accept, and nothing else will.
 *
 * Not a credential: the signature is a word, and every endpoint it could be
 * presented to is intercepted below. It exists because the member bar that
 * owns the scan button is shown to signed-in readers only — a signed-out one
 * gets a call-to-action bar in that slot — so a test about the scanner has to
 * be signed in to reach it.
 */
const fakeSession = () => {
  const b64 = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");

  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24;

  return {
    access_token: [
      b64({ alg: "HS256", typ: "JWT" }),
      b64({ sub: "e2e-user", role: "authenticated", exp: expiresAt }),
      "not-a-real-signature",
    ].join("."),
    refresh_token: "e2e-refresh",
    token_type: "bearer",
    expires_in: 60 * 60 * 24,
    expires_at: expiresAt,
    user: {
      id: "e2e-user",
      aud: "authenticated",
      role: "authenticated",
      email: "e2e@example.test",
      app_metadata: {},
      user_metadata: {},
      created_at: new Date(0).toISOString(),
    },
  };
};

export const stubBackend = async (page: Page) => {
  const session = fakeSession();
  const json = (body: unknown) => ({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(body),
  });

  /**
   * GoTrue returns bare objects, not `{ data, error }` — the client does that
   * wrapping itself.
   *
   * Getting this wrong is not a quiet mismatch. A token response with no
   * `access_token` sends supabase-js to split a JWT it does not have, and the
   * whole app dies on boot with "Cannot read properties of undefined (reading
   * 'split')" — a blank page, no route rendered, nothing to test.
   */
  await page.route("**/auth/v1/**", (route) => {
    const url = route.request().url();
    if (url.includes("/user")) return route.fulfill(json(session.user));
    if (url.includes("/token")) return route.fulfill(json(session));
    if (url.includes("/logout")) return route.fulfill({ status: 204, body: "" });
    return route.fulfill(json(session));
  });

  /**
   * PostgREST, including the part where `.single()` is not a collection.
   *
   * A `.single()` query asks for `application/vnd.pgrst.object+json` and an
   * empty result comes back as a 406 with code PGRST116 — never as `[]`.
   * Answering every read with an array meant `useVersionCheck` took an empty
   * array as its version row, read `.version` off it as undefined, and split
   * undefined. VersionProvider wraps the whole app, so that was a blank page
   * and nothing to test. Faithful beats convenient.
   */
  await page.route("**/rest/v1/**", (route) => {
    const accept = route.request().headers()["accept"] ?? "";
    if (accept.includes("vnd.pgrst.object+json")) {
      return route.fulfill({
        status: 406,
        contentType: "application/json",
        body: JSON.stringify({
          code: "PGRST116",
          details: "The result contains 0 rows",
          hint: null,
          message: "JSON object requested, multiple (or no) rows returned",
        }),
      });
    }
    return route.fulfill(json([]));
  });

  // Open Food Facts, so a scan never reaches a third party mid-test.
  await page.route("**/world.openfoodfacts.org/**", (route) => route.fulfill(json({ status: 0 })));

  // Analytics is gated on the live hostname so it should not fire here at all.
  // Blocked anyway, because a test run is not a pageview.
  await page.route("**/counterscale.peterreijm.workers.dev/**", (route) =>
    route.fulfill({ status: 204, body: "" }),
  );
};

/** Write the session where the Supabase client looks for it on boot. */
export const signIn = async (page: Page) => {
  await page.addInitScript(
    ({ ref, session }) => {
      localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(session));
    },
    { ref: PROJECT_REF, session: fakeSession() },
  );
};

/**
 * Console errors worth failing a test over.
 *
 * A blanket "no console errors" is unusable in a real browser: a blocked
 * favicon or a font that 404s in preview is noise, not a defect. This keeps
 * the ones that mean the page is broken.
 */
export const collectPageErrors = (page: Page) => {
  const errors: string[] = [];

  page.on("pageerror", (error) => errors.push(`uncaught: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (/favicon|net::ERR_|Failed to load resource/i.test(text)) return;
    errors.push(text);
  });

  return errors;
};
