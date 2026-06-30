import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@/components": path.resolve(__dirname, "src/components"),
      "@/lib": path.resolve(__dirname, "src/lib"),
    },
  },
  server: {
    // Backend (NestJS) runs on 3000; keep the frontend on 3001, which is in
    // the backend's CORS_ORIGINS allowlist.
    port: 3001,
    strictPort: true,
  },
});
