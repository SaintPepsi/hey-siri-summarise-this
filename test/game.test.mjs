import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from './harness.mjs';

test('boots with no jsdom/runtime errors', () => {
  const { errors, dom } = boot({ test: true });
  assert.equal(errors.length, 0, `unexpected errors: ${errors.join(' | ')}`);
  dom.window.close();
});

test('exposes the __TEST game hook', () => {
  const { window, dom } = boot({ test: true });
  const g = window.__game;
  assert.ok(g, '__game hook missing');
  for (const fn of ['tap', 'tick', 'buyGen', 'kick', 'recompute', 'fmtD']) {
    assert.equal(typeof g[fn], 'function', `missing ${fn}()`);
  }
  dom.window.close();
});

test('tapping increases the summary currency', () => {
  const { window, dom } = boot({ test: true });
  const g = window.__game;
  const before = g.s.dream.toString();
  g.tap();
  assert.notEqual(g.s.dream.toString(), before, 'dream did not change on tap');
  assert.ok(g.s.dream.gt(0), 'dream not positive after tap');
  dom.window.close();
});

test('recompute() is stable across repeated calls', () => {
  const { window, dom } = boot({ test: true });
  const g = window.__game;
  g.recompute();
  const a = g.m.all.toString();
  g.recompute();
  assert.equal(g.m.all.toString(), a, 'm.all drifted across recompute()');
  dom.window.close();
});
