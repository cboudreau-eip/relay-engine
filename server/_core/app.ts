/**
 * app.ts — Shared Express app factory
 *
 * This module creates and configures the Express app (middleware, tRPC, OAuth,
 * storage proxy) WITHOUT starting an HTTP server or serving static files.
 *
 * Used by:
 *   - index.ts  (Manus / standalone: starts HTTP server + serves static files)
 *   - api/server.ts  (Vercel: exports the handler, static files served by CDN)
 */

import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";

export function createApp() {
  const app = express();

  // Body parsers
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Manus storage proxy
  registerStorageProxy(app);

  // OAuth routes (/api/oauth/*)
  registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  return app;
}
