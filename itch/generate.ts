// Renders the itch.io page images from src/*.html at exact pixel sizes.
//   bun itch/generate.ts
// Regenerate after any palette change: edit the CSS vars in src/*.html, re-run.
import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

type Asset = { src: string; out: string; w: number; h: number; transparent?: boolean };

const ASSETS: Asset[] = [
  { src: "cover.html",      out: "cover-630x500.png",        w: 630,  h: 500 },
  { src: "banner.html",     out: "banner-960x320.png",       w: 960,  h: 320 },
  { src: "background.html", out: "background-1920x1080.png",  w: 1920, h: 1080 },
  { src: "embed-bg.html",   out: "embed-bg-1280x720.png",    w: 1280, h: 720 },
  // the cover Siri orb on transparent bg — also inlined into index.html as the favicon
  { src: "favicon.html",    out: "favicon-128.png",          w: 128,  h: 128, transparent: true },
];

const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const a of ASSETS) {
    const page = await browser.newPage({ viewport: { width: a.w, height: a.h }, deviceScaleFactor: 2 });
    await page.goto("file://" + join(here, "src", a.src));
    await page.waitForTimeout(300); // let fonts/gradients settle
    await page.screenshot({ path: join(here, a.out), omitBackground: a.transparent ?? false, clip: { x: 0, y: 0, width: a.w, height: a.h } });
    await page.close();
    console.log(`✓ ${a.out} (${a.w}×${a.h})`);
  }
} finally {
  await browser.close();
}
