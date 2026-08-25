import { resolve } from "node:path";
import { defineConfig } from "vite";

// Vanilla multi-page site — three static HTML entry points, no framework.
// All three must be declared explicitly so `vite build` emits each of them
// into dist/ (see https://vite.dev/guide/build.html#multi-page-app).
//
// Static assets (images/css/js) live under public/ and are NOT run through
// this — Vite copies public/ to dist/ verbatim, unhashed, so the built HTML
// keeps referencing the same /assets/... paths the source HTML uses. Do not
// import them as JS/CSS modules; that would send them through the hashed
// asset pipeline and break the absolute-path contract the source relies on.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        pricing: resolve(import.meta.dirname, "pricing.html"),
        about: resolve(import.meta.dirname, "about.html"),
      },
    },
  },
});
