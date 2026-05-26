import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function serveRepoStatic() {
  return {
    name: "serve-repo-static",
    configureServer(server) {
      const dirs = ["images", "fonts", "style", "shared"];
      for (const dir of dirs) {
        server.middlewares.use(`/${dir}`, (req, res, next) => {
          const rel = (req.url || "").split("?")[0].replace(/^\//, "");
          const file = path.join(repoRoot, dir, rel);
          if (fs.existsSync(file) && fs.statSync(file).isFile()) {
            fs.createReadStream(file).pipe(res);
          } else {
            next();
          }
        });
      }
      server.middlewares.use((req, res, next) => {
        const url = (req.url || "").split("?")[0];
        if (url === "/archetype-spread.html" || url.endsWith("/archetype-spread.html")) {
          const file = path.join(repoRoot, "archetype-spread.html");
          if (fs.existsSync(file)) {
            res.setHeader("Content-Type", "text/html");
            fs.createReadStream(file).pipe(res);
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  root: path.join(__dirname, "spa"),
  base: "./",
  plugins: [react(), serveRepoStatic()],
  resolve: {
    alias: {
      "@": path.join(__dirname, "spa", "src"),
      "@site": repoRoot,
    },
  },
  server: {
    fs: { allow: [repoRoot] },
    port: 5173,
  },
  publicDir: path.join(repoRoot, "v3", "spa", "public"),
  build: {
    outDir: path.join(repoRoot, "www"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
