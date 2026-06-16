/**
 * Vercel serverless entry point for Relay Engine.
 *
 * This committed shim is what Vercel detects as the function. It loads the
 * self-contained bundle produced at build time (api/_bundle.js by
 * esbuild.config.mjs). The bundle inlines all server/* and shared/* code, so
 * there is no cross-directory module resolution to fail at runtime.
 *
 * Any startup error is caught and returned in the response body so it can be
 * diagnosed directly instead of surfacing as an opaque FUNCTION_INVOCATION_FAILED.
 */

let cached;

async function load() {
  if (cached) return cached;
  try {
    const mod = await import("./_bundle.js");
    cached = { app: mod.default };
  } catch (error) {
    cached = { error };
  }
  return cached;
}

export default async function handler(req, res) {
  const loaded = await load();

  if (loaded.error) {
    const err = loaded.error;
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain");
    res.end("INIT_ERROR:\n" + (err?.stack || err?.message || String(err)));
    return;
  }

  return loaded.app(req, res);
}
