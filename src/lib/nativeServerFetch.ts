import type { CustomFetch } from "@tanstack/react-start";

// O domínio alternativo aponta para o mesmo backend publicado e não colide
// com a origem local usada pelo Capacitor no Android.
const PRODUCTION_SERVER = "https://chosenapp.lovable.app";
const SERVER_FN_PATH = /^\/_serverFn(?:\/|\?|$)/;

function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const capacitor = (window as unknown as {
    Capacitor?: { isNativePlatform?: () => boolean };
  }).Capacitor;
  return Boolean(capacitor?.isNativePlatform?.());
}

/**
 * O app nativo abre os arquivos locais, mas as funções que realmente dependem
 * de servidor continuam usando o backend publicado quando houver internet.
 * O navegador e o preview mantêm as chamadas na origem atual.
 */
export const nativeServerFetch: CustomFetch = (input, init) => {
  if (isNativeApp() && typeof input === "string" && SERVER_FN_PATH.test(input)) {
    return fetch(new URL(input, PRODUCTION_SERVER).toString(), init);
  }
  return fetch(input, init);
};
