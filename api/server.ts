/**
 * Vercel serverless entry point for Relay Engine.
 *
 * Vercel routes all /api/* requests here (see vercel.json rewrites).
 * Static assets in dist/public/ are served by Vercel's CDN directly.
 *
 * The build step (pnpm run build) produces:
 *   dist/public/   ← React SPA (served by Vercel CDN)
 *   dist/index.js  ← Express bundle (NOT used here; we import from source)
 *
 * We import createApp from the shared factory so the same Express middleware
 * (tRPC, OAuth, storage proxy) handles all /api/* requests in the serverless context.
 */

import "dotenv/config";
import { createApp } from "../server/_core/app";

const app = createApp();

export default app;
