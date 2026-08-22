import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// The deployed backend's CORS_ORIGINS allowlist does not include localhost, so
// calling it directly from the dev server gets blocked by the browser (the
// preflight comes back without an Access-Control-Allow-Origin header).
// Instead we proxy the backend's path prefixes through Vite: the browser makes
// a same-origin request to localhost:3001 and Vite forwards it server-side,
// where CORS does not apply. `src/config/constants.js` blanks out the API
// origin in dev so the API client emits these relative paths.
const PROXIED_PREFIXES = ["/api", "/v1", "/uploads"];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_BACKEND_URL || "http://localhost:3000";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@/components": path.resolve(__dirname, "src/components"),
        "@/lib": path.resolve(__dirname, "src/lib"),
      },
    },
    server: {
      // Backend (NestJS) runs on 3000; keep the frontend on 3001, which is the
      // default the backend falls back to when CORS_ORIGINS is unset.
      port: 3001,
      strictPort: true,
      proxy: Object.fromEntries(
        PROXIED_PREFIXES.map((prefix) => [prefix, { target, changeOrigin: true }]),
      ),
    },
  };
});
