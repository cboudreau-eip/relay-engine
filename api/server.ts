/**
 * Vercel serverless entry point for Relay Engine.
 *
 * Vercel routes all /api/* requests here (see vercel.json rewrites).
 * Static assets in dist/public/ are served by Vercel's CDN directly.
 *
 * The Express app is created lazily on first request so that any startup
 * error (module load, config) is caught and surfaced in the HTTP response
 * instead of producing an opaque FUNCTION_INVOCATION_FAILED crash.
 */

import "dotenv/config";
import type { IncomingMessage, ServerResponse } from "http";

type Loaded = { app?: (req: IncomingMessage, res: ServerResponse) => void; error?: unknown };

let cached: Loaded | null = null;

async function load(): Promise<Loaded> {
  if (cached) return cached;
  try {
    const { createApp } = await import("../server/_core/app");
    cached = { app: createApp() as any };
  } catch (error) {
    cached = { error };
  }
  return cached;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const loaded = await load();

  if (loaded.error) {
    const err = loaded.error as any;
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain");
    res.end("INIT_ERROR:\n" + (err?.stack || err?.message || String(err)));
    return;
  }

  try {
    return loaded.app!(req, res);
  } catch (error) {
    const err = error as any;
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain");
    res.end("REQUEST_ERROR:\n" + (err?.stack || err?.message || String(err)));
  }
}
