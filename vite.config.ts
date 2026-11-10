// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // O índice estático é a porta de entrada do app embutido no Capacitor.
    // As demais telas continuam sendo resolvidas pelo roteador no aparelho.
    pages: [{ path: "/" }],
    prerender: { enabled: true, autoStaticPathsDiscovery: false },
  },
  vite: {
    plugins: [
      VitePWA({
        strategies: "generateSW",
        filename: "sw.js",
        injectRegister: null,
        registerType: "autoUpdate",
        devOptions: { enabled: false },
        manifest: false,
        includeAssets: ["favicon.ico", "favicon.png", "apple-touch-icon.png"],
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,webp,ico,woff,woff2,json}"],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//, /^\/_serverFn(?:\/|$)/],
          importScripts: ["sw-events.js"],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "chosen-html",
                networkTimeoutSeconds: 3,
                cacheableResponse: { statuses: [200] },
                expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 14 },
              },
            },
            {
              urlPattern: ({ request, sameOrigin, url }) =>
                sameOrigin &&
                url.pathname.startsWith("/_build/") &&
                ["script", "style", "worker"].includes(request.destination),
              handler: "CacheFirst",
              options: {
                cacheName: "chosen-assets",
                cacheableResponse: { statuses: [200] },
                expiration: { maxEntries: 160, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              urlPattern: ({ request }) => request.destination === "image",
              handler: "CacheFirst",
              options: {
                cacheName: "chosen-images-v3",
                cacheableResponse: { statuses: [0, 200] },
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 60 },
              },
            },
            {
              urlPattern: ({ url }) =>
                url.origin === "https://fonts.googleapis.com" ||
                url.origin === "https://fonts.gstatic.com",
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "chosen-fonts",
                cacheableResponse: { statuses: [0, 200] },
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },
      }),
    ],
  },
});
