// jsdom boot harness for the single-file game.
// Strips the vendored <script src> and injects Decimal directly, so tests
// run without a network and without executing the minified lib through jsdom.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';
import Decimal from 'decimal.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function boot({ test = false, seed = null } = {}) {
  const html = fs
    .readFileSync(path.join(root, 'index.html'), 'utf8')
    .replace(/<script src="vendor\/decimal\.min\.js"><\/script>\s*/g, '');

  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => errors.push(e.detail?.message || e.message));

  const dom = new JSDOM(html, {
    url: 'https://x.test/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(w) {
      w.Decimal = Decimal;
      w.requestAnimationFrame = (cb) => cb(0);
      w.addEventListener('error', (ev) => errors.push(ev.error?.message || ev.message));
      if (test) w.__TEST = true;
      if (seed) {
        try {
          w.localStorage.setItem('siri_idle_save_v1', seed);
        } catch {
          /* storage blocked — degrade to non-persistent, as the game does */
        }
      }
    },
  });

  return { dom, window: dom.window, document: dom.window.document, errors };
}
