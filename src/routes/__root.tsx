import type { ErrorComponentProps } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { useNativeNotifications } from "@/hooks/useNativeNotifications";
import { FloatingMenu } from "@/components/FloatingMenu";
import { useShakeToChosen } from "@/hooks/useShakeToChosen";
import { useTimeOfDayTheme } from "@/hooks/useTimeOfDayTheme";
import { useUsageTracker } from "@/hooks/useUsageTracker";
import { useAppShortcuts } from "@/hooks/useAppShortcuts";
import { usePushRegistration } from "@/hooks/usePushRegistration";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset?.();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover, interactive-widget=resizes-content" },
      { title: "CHOSEN" },
      { name: "description", content: "Inspirações - Escolhidas!" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "CHOSEN" },
      { property: "og:description", content: "Inspirações - Escolhidas!" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "CHOSEN" },
      { name: "twitter:description", content: "Inspirações - Escolhidas!" },
      { property: "og:url", content: "https://chosen.oonn.com.br/" },
      { property: "og:site_name", content: "CHOSEN" },
      { property: "og:image", content: "https://chosen.oonn.com.br/og-chosen.jpg?v=2" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: "https://chosen.oonn.com.br/og-chosen.jpg?v=2" },
      { name: "theme-color", content: "#ffffff" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "CHOSEN" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "64x64",
        href: "/favicon.png?v=2",
      },
      {
        rel: "icon",
        sizes: "any",
        href: "/favicon.ico?v=2",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png?v=2",
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [isMono, setIsMono] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isMono') === 'true';
    }
    return false;
  });

  useNativeNotifications();
  useShakeToChosen();
  useTimeOfDayTheme();
  useUsageTracker();
  useAppShortcuts();
  usePushRegistration();

  useEffect(() => {
    localStorage.setItem('isMono', isMono.toString());
    if (isMono) {
      document.documentElement.classList.add('grayscale');
    } else {
      document.documentElement.classList.remove('grayscale');
    }
  }, [isMono]);

  useEffect(() => {
    // O modo offline web fica isolado neste módulo para nunca afetar o preview
    // nem criar cache desnecessário no app nativo, que já traz seus arquivos.
    void import("@/lib/registerOffline")
      .then(({ registerOffline }) => registerOffline())
      .catch(() => {});
  }, []);

  // Back button no Android nativo: só sai do app na rota raiz/home.
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    (async () => {
      const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
      if (!isNative) return;
      try {
        const { App } = await import('@capacitor/app');
        const handler = await App.addListener('backButton', ({ canGoBack }) => {
          const path = window.location.pathname;
          if (path === '/' || path === '/home') {
            App.exitApp();
          } else if (canGoBack) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });
        cleanup = () => handler.remove();
      } catch {}
    })();
    return () => cleanup?.();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <FloatingMenu />
      <Toaster
        position="top-center"
        offset="calc(env(safe-area-inset-top, 0px) + 24px)"
        mobileOffset="calc(env(safe-area-inset-top, 0px) + 32px)"
      />
    </QueryClientProvider>
  );
}