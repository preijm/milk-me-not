import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default (defineConfig as any)(({ mode }: { mode: string }) => ({
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
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  build: {
    sourcemap: true,
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
