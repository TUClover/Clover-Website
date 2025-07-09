import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { execSync } from "child_process";
import pkg from "../package.json";

const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
const version = pkg.version;

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  root: ".",
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "CNAME",
          dest: ".",
        },
        {
          src: "dist/index.html",
          dest: ".",
          rename: "404.html",
        },
      ],
    }),
  ],
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
    __APP_VERSION__: JSON.stringify(version),
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: ["clover.nickrucinski.com"], // Allow your domain
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
