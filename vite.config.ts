import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { readFileSync, writeFileSync } from "fs";
import { STATIC_SEO, htmlForRoute } from "./src/lib/staticSeo";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";

/**
 * What build this is, decided once and written in two places.
 *
 * The version check used to ask Supabase's `app_versions` table what the
 * latest release was, and compare it against a version string typed into
 * `appVersion.ts` by hand. Both had to be remembered on every release, and
 * neither was: the table held one row from January while the site deployed
 * dozens of times, so `isNewerVersion` was permanently false and the update
 * banner could not fire at all. A reader with the tab open kept whatever
 * bundle they first loaded.
 *
 * The build knows what build it is, so nothing has to be remembered. The
 * commit sha in CI, a timestamp locally — the only property that matters is
 * that it differs when the deployed files differ.
 */
const BUILD_ID = (process.env.GITHUB_SHA ?? "").slice(0, 12) || `dev-${Date.now()}`;

/**
 * Emit the same id as a file the running app can fetch.
 *
 * Written from the bundle rather than kept in `public/` so the two can never
 * drift: a copy in `public/` is whatever was committed, which is exactly the
 * hand-maintained value this replaces.
 */
type Emitter = {
  emitFile: (asset: { type: "asset"; fileName: string; source: string }) => void;
};

const emitBuildId = () => ({
  name: "emit-build-id",
  generateBundle(this: Emitter) {
    this.emitFile({
      type: "asset",
      fileName: "version.json",
      source: JSON.stringify({ buildId: BUILD_ID }),
    });
  },
});

/**
 * Write `about.html`, `results.html` and the rest beside `index.html`, each
 * with its own title, description and canonical already in the head.
 *
 * `.html` files rather than `about/index.html`: the Worker serves a file at
 * the bare path and a folder index at the path with a trailing slash, and the
 * canonical is the bare one. Routes with no file — /product/:id and the like —
 * still fall through to `index.html`, which is untouched.
 *
 * Only the head. The body is still the empty root React fills in, because
 * markup put there would be torn down and redrawn on every visit unless the
 * app hydrated it, and that is a different project.
 */
const routeHeads = () => ({
  name: "route-heads",
  apply: "build" as const,
  writeBundle(options: { dir?: string }) {
    const dir = options.dir ?? "dist";
    const shell = readFileSync(path.join(dir, "index.html"), "utf8");
    for (const [route, seo] of Object.entries(STATIC_SEO)) {
      writeFileSync(path.join(dir, `${route.slice(1)}.html`), htmlForRoute(shell, route, seo));
    }
  },
});

/**
 * Upload source maps to Sentry, so production stack traces name real files
 * and lines instead of `index-3f2a.js:1:48213`.
 *
 * Only when `SENTRY_AUTH_TOKEN` is set, which is the deploy build and nothing
 * else. Without it there are no maps and no plugin, and the build is the same
 * as before — like the DSN, a missing token must never fail a deploy.
 *
 * - `release` is `BUILD_ID`, the same value `errorReporting.ts` hands the SDK.
 *   The plugin's own default is the full commit sha; the SDK sends 12
 *   characters, so the two would never meet. `inject: false` because the SDK
 *   already sets the release, and injecting it rehashes every chunk per build.
 * - The maps are `hidden` (no `sourceMappingURL` comment) and deleted from
 *   `dist` after the upload, so the edge never serves them. `deploy.yml` also
 *   deletes any left over, in case an upload fails before this cleanup runs.
 * - A failed upload warns instead of throwing: unreadable traces are a nicety
 *   lost, a failed deploy is the site going stale.
 * - `telemetry: false`: the plugin otherwise reports on itself to Sentry.
 */
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN || undefined;

const sentrySourceMaps = () =>
  sentryVitePlugin({
    org: "peter-co",
    project: "milkmenot-frontend",
    authToken: SENTRY_AUTH_TOKEN,
    release: { name: BUILD_ID, inject: false },
    sourcemaps: { filesToDeleteAfterUpload: ["./dist/**/*.map"] },
    telemetry: false,
    errorHandler: (err: Error) => {
      console.warn(`Sentry source map upload failed; deploying without it: ${err.message}`);
    },
  });

// https://vitejs.dev/config/
export default (defineConfig as any)(({ mode }: { mode: string }) => ({
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  server: {
    host: "::",
    port: Number(process.env.PORT) || 8080,
  },
  oxc: {
    transform: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  },
  plugins: [
    react(),
    emitBuildId(),
    routeHeads(),
    mode === 'development' &&
    componentTagger(),
    // Last, as Sentry requires: it reads the finished output.
    SENTRY_AUTH_TOKEN && sentrySourceMaps(),
  ].filter(Boolean),
  build: {
    // Only for Sentry, and only when there is a token to upload them with
    // (see sentrySourceMaps above). 'hidden' leaves no sourceMappingURL in the
    // bundle; the files themselves are deleted before wrangler uploads dist —
    // they were 12.6 MB of every 20 MB upload when they used to ship.
    sourcemap: SENTRY_AUTH_TOKEN ? 'hidden' : false,
    rolldownOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;
          // Before the react rule, and that ordering is the whole point:
          // `@sentry/react` contains the substring "react", so the generic rule
          // swallowed the entire SDK into vendor-react — which is loaded
          // eagerly. Setting a DSN took that chunk from 440KB to 904KB on the
          // critical path, for something the dynamic import in
          // errorReporting.ts is careful to fetch only when it is needed.
          if (id.includes('@sentry')) return 'vendor-sentry';
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor-react';
          if (id.includes('@supabase/supabase-js')) return 'vendor-supabase';
          if (id.includes('@tanstack/react-query')) return 'vendor-query';
          if (id.includes('@radix-ui/react-dialog') || id.includes('@radix-ui/react-dropdown-menu') || id.includes('@radix-ui/react-popover') || id.includes('@radix-ui/react-tooltip') || id.includes('@radix-ui/react-tabs')) return 'vendor-ui';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('mapbox-gl')) return 'vendor-mapbox';
          if (id.includes('recharts')) return 'vendor-charts';
          if (id.includes('date-fns')) return 'vendor-date';
          if (id.includes('embla-carousel')) return 'vendor-carousel';
          if (id.includes('react-icons')) return 'vendor-icons';
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
