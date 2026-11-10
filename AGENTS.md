# Architecture

- Native iOS/Android builds load the bundled `.output/public` app instead of `server.url`, so the Bible, messages, prayers, and local preferences work offline; server-dependent features use the published alternate origin explicitly when online to avoid colliding with Capacitor's local hostname.
- Offline web support uses `vite-plugin-pwa` with `generateSW` and one guarded registration wrapper; never register the app service worker in dev, iframes, Lovable previews, or native bundled builds.
