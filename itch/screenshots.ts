// Captures gameplay screenshots from the live game for the itch.io page.
// Requires the game served locally first:  npm run serve   (http://localhost:8000)
// Then:  bun itch/screenshots.ts
import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const URL = "http://localhost:8000/";
const W = 1280, H = 800;

const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  await page.goto(URL);
  await page.waitForSelector("#go");
  await page.waitForTimeout(400);

  // 1) fresh title / hero state
  await page.screenshot({ path: join(here, "shot-1-title.png") });
  console.log("✓ shot-1-title.png");

  // 2) mid-play: tap a bunch so numbers climb and floats fly
  for (let i = 0; i < 25; i++) { await page.click("#go"); await page.waitForTimeout(40); }
  await page.screenshot({ path: join(here, "shot-2-tapping.png") });
  console.log("✓ shot-2-tapping.png");

  // 3) the upgrades / model-upgrades panel (the core loop hook)
  const upgrades = page.locator(".panel").first();
  await upgrades.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await page.screenshot({ path: join(here, "shot-3-upgrades.png") });
  console.log("✓ shot-3-upgrades.png");

  // 4) light theme — show the toggle works (distinctive feature)
  await page.click("#themebtn");
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: join(here, "shot-4-light.png") });
  console.log("✓ shot-4-light.png");

  await page.close();
} finally {
  await browser.close();
}
