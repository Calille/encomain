import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

const conditionalPlugins: [string, Record<string, any>][] = [];

// @ts-ignore
if (process.env.TEMPO === "true") {
  conditionalPlugins.push(["tempo-devtools/swc", {}]);
}

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",
  
  build: {
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          // Separate vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation-vendor': ['framer-motion'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-slot'],
          // Route-based chunks
          'home-route': ['./src/components/home', './src/components/hero'],
          'routes-secondary': [
            './src/components/services',
            './src/components/pricing-page',
            './src/components/about'
          ]
        }
      }
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 500,
    // CSS code splitting
    cssCodeSplit: true,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    // Source maps for production (optional, disable for smaller builds)
    sourcemap: false,
  },

  optimizeDeps: {
    entries: ["src/main.tsx"],
    include: ['react', 'react-dom', 'react-router-dom'],
    // Exclude heavy dependencies that should be lazy loaded
    exclude: ['ogl'],
  },

  plugins: [
    react({
      plugins: conditionalPlugins,
      // Enable fast refresh
      fastRefresh: true,
    }),
    tempo(),
  ],

  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    // @ts-ignore
    allowedHosts: true,
  }
});
