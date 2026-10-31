import { defineConfig } from "vite";

// Relative base so the built game runs from any sub-path, including GitHub Pages
// (https://<user>.github.io/<repo>/). `assetUrl` in src/assets.ts reads BASE_URL, so every sprite
// resolves against the same base.
export default defineConfig({
  base: "./",
});
