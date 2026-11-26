import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const loadModule = async path => import(`data:text/javascript;base64,${Buffer.from(await readFile(new URL(path, import.meta.url))).toString('base64')}`);
const { createGraphicsLoop } = await loadModule('../../app/lib/graphicsLoop.js');
const { getFogViewport } = await loadModule('../../app/lib/fogViewport.js');

function environment(reduced = false) {
  let id = 0;
  const frames = new Map();
  const motion = new EventTarget();
  motion.matches = reduced;
  globalThis.window = { matchMedia: () => motion };
  globalThis.document = new EventTarget();
  document.hidden = false;
  globalThis.requestAnimationFrame = callback => { frames.set(++id, callback); return id; };
  globalThis.cancelAnimationFrame = id => frames.delete(id);
  let intersection;
  let disconnected = false;
  globalThis.IntersectionObserver = class {
    constructor(callback) { intersection = callback; }
    observe() {}
    disconnect() { disconnected = true; }
  };
  return {
    frames, motion,
    step(time) {
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach(callback => callback(time));
    },
    visible(value) { intersection([{ isIntersecting: value }]); },
    get disconnected() { return disconnected; },
  };
}

test('keeps approximately 60 draws/second on 60, 120 and 144 Hz displays, even when invalidated', () => {
  for (const hz of [60, 120, 144]) {
    const env = environment();
    const calls = [];
    const loop = createGraphicsLoop({}, (...args) => calls.push(args));
    for (let i = 0; i < hz; i++) { loop.invalidate(); env.step(i * 1000 / hz); }
    assert.ok(calls.length >= 59 && calls.length <= 61, `${hz}Hz produced ${calls.length} draws`);
    assert.ok(calls.slice(1).every(([, delta]) => delta > 0));
    loop.destroy();
    assert.equal(env.frames.size, 0);
  }
});

test('sleeps offscreen/hidden, resumes without a large time step, and cannot restart after disposal', () => {
  const env = environment();
  const calls = [];
  const loop = createGraphicsLoop({}, (...args) => calls.push(args));
  env.step(0);
  env.visible(false);
  loop.invalidate();
  assert.equal(env.frames.size, 0);
  env.visible(true);
  env.step(10000);
  assert.equal(calls.at(-1)[1], 0);
  document.hidden = true;
  document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(env.frames.size, 0);
  document.hidden = false;
  document.dispatchEvent(new Event('visibilitychange'));
  env.step(20000);
  assert.equal(calls.at(-1)[1], 0);
  loop.destroy();
  loop.invalidate();
  document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(env.frames.size, 0);
  assert.equal(env.disconnected, true);
});

test('reduced motion draws a static frame and redraws only when invalidated', () => {
  const env = environment(true);
  const calls = [];
  const loop = createGraphicsLoop({}, (...args) => calls.push(args));
  env.step(0);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][2], true);
  assert.equal(env.frames.size, 0);
  loop.invalidate();
  env.step(100);
  assert.equal(calls.length, 2);
  assert.equal(env.frames.size, 0);
  env.motion.matches = false;
  env.motion.dispatchEvent(new Event('change'));
  env.step(200);
  assert.equal(env.frames.size, 1);
  loop.destroy();
});

test('fog crop preserves the original top-of-page coordinates and includes parallax overscan', () => {
  for (const [width, viewport, virtualHeight, dpr, scale] of [
    [1440, 900, 2880, 2, 2], [390, 844, 5000, 3, 4], [981, 799, 4000, 3, 2],
  ]) {
    const height = Math.ceil(viewport * 1.2);
    const crop = getFogViewport(width, height, virtualHeight, dpr, scale);
    const bufferHeight = Math.floor(height * crop.renderDpr);
    const sourceHeight = Math.floor(virtualHeight * dpr / scale);
    assert.ok(height - viewport >= viewport * .2 - 1);
    assert.ok(crop.renderDpr <= 1);
    assert.deepEqual(crop.resolution, [width / scale, virtualHeight / scale]);
    // Map the crop's top edge (and a point 200px below it) back into the
    // original field, including the inverse Y axis and DPR cap.
    for (const cssY of [0, 200]) {
      const mapped = (bufferHeight - cssY * crop.renderDpr) * crop.coordinateScale[1] + crop.offset[1];
      assert.ok(Math.abs(mapped - (sourceHeight - cssY * dpr / scale)) < 1e-9);
    }
  }
});
