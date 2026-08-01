/**
 * /api/chat — proxy to YourAIDoctor Node.js backend.
 *
 * Routes chat messages to the local/deployed Node.js backend at
 * HF_BACKEND_URL (default: http://localhost:4000).
 * The backend handles: Gemini AI, RAG pipeline, clinical reasoning,
 * session management, and guest fallback.
 *
 * Configuration (set in .env.local):
 *   HF_BACKEND_URL          backend URL (local: http://localhost:4000,
 *                           production: https://youraidoctor.in/api)
 *   HF_BACKEND_TIMEOUT_MS   optional timeout (default 50000ms).
 */

import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_BACKEND = "https://your-aidoctor.vercel.app";
const DEFAULT_TIMEOUT_MS = 50_000;

function resolveBackendURL(): string {
  const raw =
    process.env.HF_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    DEFAULT_BACKEND;
  return raw.replace(/\/+$/, "");
}

export async function POST(req: NextRequest): Promise<Response> {
  const backend = resolveBackendURL();
  const upstream = `${backend}/api/chat`;

  const bodyText = await req.text();

  const startedAt = Date.now();
  console.log(
    `[Proxy] /api/chat → ${upstream} (${bodyText.length}B in)`,
  );

  const timeoutMs = Number(
    process.env.HF_BACKEND_TIMEOUT_MS || DEFAULT_TIMEOUT_MS,
  );
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  if (req.signal) {
    req.signal.addEventListener("abort", () => controller.abort(), {
      once: true,
    });
  }

  let res: Response;
  try {
    res = await fetch(upstream, {
      method: "POST",
      headers: buildForwardHeaders(req),
      body: bodyText,
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timer);
    const aborted = err?.name === "AbortError";
    console.error(
      `[Proxy] fetch to ${upstream} failed (${Date.now() - startedAt}ms):`,
      err?.message || err,
    );
    return jsonError(
      aborted
        ? "The medical AI took too long to respond. Please try again."
        : "Could not reach the medical AI backend. Please try again.",
      aborted ? "backend_timeout" : "backend_unreachable",
      aborted ? 504 : 502,
    );
  }
  clearTimeout(timer);

  const upstreamContentType = res.headers.get("content-type") || "";
  console.log(
    `[Proxy] ${upstream} → ${res.status} content-type=${upstreamContentType} (${Date.now() - startedAt}ms TTFB)`,
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(
      `[Proxy] upstream error ${res.status}: ${text.slice(0, 300)}`,
    );
    return jsonError(
      `The medical AI backend returned an error (${res.status}). Please try again in a moment.`,
      "backend_error",
      res.status >= 500 ? 502 : res.status,
      { upstreamStatus: res.status, upstreamBody: text.slice(0, 500) },
    );
  }

  if (!res.body) {
    return new Response("data: [DONE]\n\n", {
      status: 200,
      headers: sseHeaders(),
    });
  }

  // If backend returns plain text (our Node.js backend), convert it to SSE
  // so the frontend useChat.ts streaming parser can handle it properly.
  if (upstreamContentType.includes("text/plain")) {
    const text = await res.text();
    // Emit one SSE data frame with the full content, then [DONE]
    const sseBody =
      `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n` +
      `data: [DONE]\n\n`;
    return new Response(sseBody, {
      status: 200,
      headers: sseHeaders(),
    });
  }

  // Stream the upstream body straight through for SSE responses.
  return new Response(res.body, {
    status: 200,
    headers: {
      ...sseHeaders(),
      "Content-Type": upstreamContentType || "text/event-stream",
    },
  });
}

export async function GET(): Promise<Response> {
  return new Response("Method Not Allowed — use POST", { status: 405 });
}

function buildForwardHeaders(req: NextRequest): HeadersInit {
  const out: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/plain, text/event-stream",
  };
  const cookie = req.headers.get("cookie");
  if (cookie) out.Cookie = cookie;
  const acceptLang = req.headers.get("accept-language");
  if (acceptLang) out["Accept-Language"] = acceptLang;
  const realIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
  if (realIp) out["X-Forwarded-For"] = realIp;
  // Forward auth token if present
  const token = req.headers.get("token");
  if (token) out["token"] = token;
  return out;
}

function sseHeaders(): Record<string, string> {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-store",
    Connection: "keep-alive",
  };
}

function jsonError(
  message: string,
  code: string,
  status: number,
  extra?: Record<string, unknown>,
): Response {
  return new Response(
    JSON.stringify({ error: message, code, ...(extra ?? {}) }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    },
  );
}
