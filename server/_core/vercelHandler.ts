/**
 * Entry point that gets bundled (by esbuild.config.mjs) into a single
 * self-contained file at api/_bundle.js for the Vercel serverless function.
 *
 * Bundling inlines all of the server/* and shared/* source so there are no
 * cross-directory imports left for Node to resolve at runtime — which is what
 * caused ERR_MODULE_NOT_FOUND when Vercel tried to load the raw source tree.
 */
import { createApp } from "./app";

const app = createApp();

export default app;
