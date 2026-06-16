import { build } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolve path aliases (@shared/*, @/*) to real files so they get bundled
 * into the output. Without this, esbuild's --packages=external would treat
 * these bare specifiers as external npm packages and the production runtime
 * would fail with ERR_MODULE_NOT_FOUND.
 */
const aliasPlugin = {
  name: "alias",
  setup(b) {
    b.onResolve({ filter: /^@shared\// }, (args) => {
      const rel = args.path.replace(/^@shared\//, "");
      return { path: path.resolve(__dirname, "shared", rel + ".ts") };
    });
    b.onResolve({ filter: /^@\// }, (args) => {
      const rel = args.path.replace(/^@\//, "");
      return { path: path.resolve(__dirname, "client", "src", rel) };
    });
  },
};

const shared = {
  platform: "node",
  packages: "external",
  bundle: true,
  format: "esm",
  plugins: [aliasPlugin],
};

// Standalone server bundle (used by `node dist/index.js` for non-Vercel hosts).
await build({
  ...shared,
  entryPoints: ["server/_core/index.ts"],
  outdir: "dist",
});

// Self-contained serverless bundle consumed by the Vercel function (api/server.js).
// All local server/* and shared/* imports are inlined here so the function has
// no cross-directory module resolution to do at runtime.
await build({
  ...shared,
  entryPoints: ["server/_core/vercelHandler.ts"],
  outfile: "api/_bundle.js",
});

console.log("Server bundles built (dist/index.js + api/_bundle.js).");
