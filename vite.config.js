import { resolve } from "node:path";
import { defineConfig } from "vite";

// Vanilla multi-page site â€” three static HTML entry points, no framework.
// All three must be declared explicitly so `vite build` emits each of them
// into dist/ (see https://vite.dev/guide/build.html#multi-page-app).
//
// Static assets (images/css/js) live under public/ and are NOT run through
// this â€” Vite copies public/ to dist/ verbatim, unhashed, so the built HTML
// keeps referencing the same /assets/... paths the source HTML uses. Do not
// import them as JS/CSS modules; that would send them through the hashed
// asset pipeline and break the absolute-path contract the source relies on.
export default defineConfig({
  // GitHub Pages serves a project repo from a subpath, so the deployed build
  // needs its asset URLs prefixed. Redline, however, measures a build served
  // at the ORIGIN root — prefixing there would 404 every asset and make a
  // healthy page measure as a broken one. So the prefix is applied only by
  // the Pages workflow, which sets GITHUB_PAGES=1.
  base: process.env.GITHUB_PAGES ? "/redline-demo-site/" : "/",
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

