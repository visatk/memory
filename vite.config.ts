import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import path from "path";

export default defineConfig({
  // Notice the simplification: No PostCSS config required
  plugins: [
    tailwindcss(), 
    react(), 
    cloudflare()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    // The Vite dev server is natively backed by the `workerd` runtime via the cloudflare() plugin
  },
});
