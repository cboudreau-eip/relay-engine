import { build } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolve path aliases (@shared/*, @/*) to real files so they get bundled
 * into dist/index.js. Without this, esbuild's --packages=external would treat
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

await build({
  entryPoints: ["server/_core/index.ts"],
  platform: "node",
  packages: "external",
  bundle: true,
  format: "esm",
  outdir: "dist",
  plugins: [aliasPlugin],
});

console.log("Server bundle built with alias resolution.");
