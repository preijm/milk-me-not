import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // `supabase/functions` is Deno code and is not typechecked or bundled with
    // the app, but `_shared/secretKey.ts` decides which credential a function
    // runs as, so it is worth a test. Only `*.test.ts` is collected, so the
    // function entrypoints and their remote `https://esm.sh/…` imports stay out.
    include: ["src/**/*.{test,spec}.{ts,tsx}", "supabase/functions/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
