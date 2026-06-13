// Captures gameplay screenshots from the live game for the itch.io page.
// The game is a self-contained static file, so we load it via file:// — no server needed.
//   bun itch/screenshots.ts      (or: node itch/screenshots.ts)
import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const URL = "file://" + join(here, "..", "index.html");
// Portrait: the UI is now a centred, viewport-locked app shell, so portrait frames it best.
const W = 640, H = 960;

const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  await page.goto(URL);
  await page.waitForSelector("#go");
  await page.waitForTimeout(400);

  // 1) fresh title / hero state
  await page.screenshot({ path: join(here, "shot-1-title.png") });
  console.log("✓ shot-1-title.png");

  // 2) mid-play: tap so numbers climb, summaries stack, floats fly
  for (let i = 0; i < 40; i++) { await page.click("#go"); await page.waitForTimeout(35); }
  await page.screenshot({ path: join(here, "shot-2-tapping.png") });
  console.log("✓ shot-2-tapping.png");

  // 3) the shop sheet — open Features (the core buying loop) and buy a couple generators
  await page.click('.tab[data-shop="gen"]');
  await page.waitForTimeout(450);
  const gen = page.locator("#genlist [data-gen]").first();
  for (let i = 0; i < 3; i++) { await gen.click().catch(() => {}); await page.waitForTimeout(80); }
  await page.waitForTimeout(250);
  await page.screenshot({ path: join(here, "shot-3-upgrades.png") });
  console.log("✓ shot-3-upgrades.png");

  // 4) light theme — toggle via Settings (its new home), then close the sheet to show the app
  await page.click('.tab[data-shop="settings"]');
  await page.waitForTimeout(450);
  await page.click("#themetoggle");
  await page.waitForTimeout(250);
  await page.click("#sheetclose");
  await page.waitForTimeout(450);
  await page.screenshot({ path: join(here, "shot-4-light.png") });
  console.log("✓ shot-4-light.png");

  await page.close();
} finally {
  await browser.close();
}
