import { readFileSync } from "node:fs";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const { version } = JSON.parse(
  readFileSync(path.resolve(__dirname, "../package.json"), "utf8"),
);

// Backend (Elysia) runs on :3000 in dev. Vite serves the SPA on :5173 and
// proxies data/file/auth requests to the backend. Navigations stay with Vite.
const backend = {
  target: "http://localhost:3000",
  changeOrigin: true,
  ws: true,
};

export default defineConfig({
  root: __dirname,
  base: "/",
  define: { __APP_VERSION__: JSON.stringify(version) },
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  build: {
    outDir: path.resolve(__dirname, "../dist-client"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": backend,
      "/addons": backend,
      "/login": backend,
      "/auth": backend,
      "/exit": backend,
      "/upload": backend,
      "/pushtotalk": backend,
      "/u": backend,
      "/a": backend,
      "/s": backend,
      "/public": backend,
      "/health": backend,
      "/sitemap.xml": backend,
      "/robots.txt": backend,
      // Authenticated profile mutations + data (but NOT the /profile navigation)
      "^/profile/(data|user|presentation|session|hosted|plugin|component|template|theme)":
        backend,
      // The POST search API (two path segments) — the /search page stays with Vite
      "^/search/[^/]+/[^/]+$": backend,
    },
  },
});
