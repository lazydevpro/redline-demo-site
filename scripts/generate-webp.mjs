#!/usr/bin/env node
// Generates a WebP sibling next to every raster image (.jpg/.jpeg/.png)
// under public/assets/img/, at ~80 quality. Re-runnable: safe to run again
// after adding/replacing images, it just overwrites the matching .webp.
//
// Deliberately does NOT touch any HTML — no <img src> is rewritten and no
// <picture> tags are added here. The generated .webp files ship unused
// until something (Redline's image-optimization fix, or a human) wires up
// a <picture>/<source type="image/webp"> to reference them. That gap is
// the point: this script mirrors a real "we ran an image optimizer but
// forgot to touch the markup" situation.
//
// Usage: node scripts/generate-webp.mjs

import { readdir, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const IMG_DIR = join(__dirname, "..", "public", "assets", "img");
const RASTER_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);
const WEBP_QUALITY = 80;

async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await walk(fullPath)));
        } else if (RASTER_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
            files.push(fullPath);
        }
    }
    return files;
}

async function main() {
    const rasters = (await walk(IMG_DIR)).sort();
    if (rasters.length === 0) {
        console.log(`No raster images (.jpg/.jpeg/.png) found under ${IMG_DIR}`);
        return;
    }

    let totalRasterBytes = 0;
    let totalWebpBytes = 0;
    const rows = [];

    for (const rasterPath of rasters) {
        const webpPath = rasterPath.replace(/\.(jpe?g|png)$/i, ".webp");
        const rasterStat = await stat(rasterPath);

        await sharp(rasterPath).webp({ quality: WEBP_QUALITY }).toFile(webpPath);

        const webpStat = await stat(webpPath);
        totalRasterBytes += rasterStat.size;
        totalWebpBytes += webpStat.size;

        rows.push({
            file: relative(IMG_DIR, rasterPath).replace(/\\/g, "/"),
            rasterKB: (rasterStat.size / 1024).toFixed(1),
            webpKB: (webpStat.size / 1024).toFixed(1),
            savedPct: (100 * (1 - webpStat.size / rasterStat.size)).toFixed(0),
        });
    }

    const pad = (s, n) => String(s).padEnd(n);
    console.log(pad("file", 34), pad("raster KB", 12), pad("webp KB", 12), "saved");
    for (const r of rows) {
        console.log(pad(r.file, 34), pad(r.rasterKB, 12), pad(r.webpKB, 12), `${r.savedPct}%`);
    }
    console.log("");
    console.log(
        `${rows.length} webp file(s) written. Total: ${(totalRasterBytes / 1024).toFixed(1)} KB -> ${(
            totalWebpBytes / 1024
        ).toFixed(1)} KB (saved ${(totalRasterBytes - totalWebpBytes) / 1024 | 0} KB, ${(
            100 *
            (1 - totalWebpBytes / totalRasterBytes)
        ).toFixed(0)}%)`
    );
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
