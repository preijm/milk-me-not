import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  build: {
    // Nothing consumes these. The repo is public, so they guard no secret
    // either — they were simply 12.6 MB of every 20 MB upload. If an error
    // reporter is added later, switch to 'hidden' and ship the maps to that
    // service instead of to the edge.
    sourcemap: false,
    rolldownOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;
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
