import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

const NATIVE_ORIGINS = new Set([
  "capacitor://localhost",
  "capacitor://chosen.oonn.com.br",
  "https://localhost",
  "http://localhost",
  "https://chosen.oonn.com.br",
]);

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function isServerFunctionRequest(request: Request): boolean {
  const path = new URL(request.url).pathname;
  return path === "/_serverFn" || path.startsWith("/_serverFn/");
}

function withNativeCors(request: Request, response: Response): Response {
  if (!isServerFunctionRequest(request)) return response;
  const origin = request.headers.get("origin");
  if (!origin || !NATIVE_ORIGINS.has(origin)) return response;

  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Vary", headers.has("Vary") ? `${headers.get("Vary")}, Origin` : "Origin");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function preflightResponse(request: Request): Response {
  const origin = request.headers.get("origin");
  const headers = new Headers({ "Access-Control-Max-Age": "86400" });
  if (origin && NATIVE_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set(
      "Access-Control-Allow-Headers",
      "Accept, Authorization, Content-Type, X-Requested-With, X-TSR-ServerFn",
    );
    headers.set("Vary", "Origin");
  }
  return new Response(null, { status: 204, headers });
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    if (request.method === "OPTIONS" && isServerFunctionRequest(request)) {
      return preflightResponse(request);
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return withNativeCors(request, normalized);
    } catch (error) {
      console.error(error);
      return withNativeCors(
        request,
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    }
  },
};
