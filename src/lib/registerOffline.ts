import { registerSW } from "virtual:pwa-register";

const DELEGATED_PREVIEW_HOST = "id-preview--cf808645-b75a-4bfa-9566-876b26385e38.lovable.app";
const PROJECT_DEV_LABEL = "project--cf808645-b75a-4bfa-9566-876b26385e38-dev";
const PREVIEW_LABEL = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/;

function isLovablePreview(hostname: string): boolean {
  const firstLabel = hostname.split(".")[0];
  const previewDomain = ["lovable.app", "gpt-eng.com", "gptengineer.run"].some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );

  return (
    hostname === DELEGATED_PREVIEW_HOST ||
    (previewDomain && PREVIEW_LABEL.test(firstLabel)) ||
    (previewDomain && firstLabel === PROJECT_DEV_LABEL) ||
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev")
  );
}

function isNativeApp(): boolean {
  const capacitor = (window as unknown as {
    Capacitor?: { isNativePlatform?: () => boolean };
  }).Capacitor;
  return Boolean(capacitor?.isNativePlatform?.());
}

async function unregisterChosenWorker(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((registration) => {
        const scripts = [registration.active, registration.waiting, registration.installing];
        return scripts.some((script) => {
          if (!script) return false;
          const url = new URL(script.scriptURL);
          return url.origin === window.location.origin && url.pathname === "/sw.js";
        });
      })
      .map((registration) => registration.unregister()),
  );
}

/** Único ponto de registro do service worker offline do Chosen. */
export async function registerOffline(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const hostname = window.location.hostname.toLowerCase();
  const refused =
    !import.meta.env.PROD ||
    window.self !== window.top ||
    isNativeApp() ||
    isLovablePreview(hostname) ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    new URLSearchParams(window.location.search).get("sw") === "off";

  if (refused) {
    await unregisterChosenWorker().catch(() => {});
    return;
  }

  registerSW({
    immediate: true,
    onRegisterError(error: Error) {
      console.error("Não foi possível ativar o modo offline:", error);
    },
  });
}
