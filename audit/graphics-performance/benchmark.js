import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import FOG from 'vanta/dist/vanta.fog.min.js';
import { cropFogShader, getFogViewport } from '../../app/lib/fogViewport.js';
import vertexShader from '../../app/shaders/vertex.js';
import fragmentShader from '../../app/shaders/fragment.js';
import { horizontalBlurShader } from '../../app/shaders/horizontalBlurShader.js';
import { verticalBlurShader } from '../../app/shaders/verticalBlurShader.js';

const output = document.querySelector('#output');
const stage = document.querySelector('#stage');
const nextFrame = () => new Promise(requestAnimationFrame);
const percentile = (values, p) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))];
};
const summary = values => ({ count: values.length, median: percentile(values, .5), p95: percentile(values, .95), mean: values.length ? values.reduce((a, b) => a + b, 0) / values.length : null });
const transparent = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader: 'varying vec2 vUv;uniform sampler2D tDiffuse;void main(){vec4 c=texture2D(tDiffuse,vUv);if(c.r<.08&&c.g<.08&&c.b<.08)c.a=0.;gl_FragColor=c;}',
};

function makeTorus(c) {
  const canvas = document.createElement('canvas');
  stage.append(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !c.optimized, preserveDrawingBuffer: !c.optimized });
  renderer.setClearColor(0, 0);
  renderer.setPixelRatio(Math.min(c.dpr, 2));
  renderer.setSize(c.size, c.size, false);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, .01, 100);
  camera.position.z = c.mobilePipeline ? 20 : 2.6;
  const geometry = new THREE.TorusGeometry(1, .3, c.radial || 500, c.tubular || 500);
  const uniforms = {
    uTime: { value: 0 }, uMouseWorld: { value: new THREE.Vector3() }, uResolution: { value: new THREE.Vector2() },
    uDisplace: { value: 1.2 }, uSpread: { value: .5 }, uNoise: { value: 16 },
    uOldColor1: { value: new THREE.Vector3(2, 1.01, 2) }, uOldColor2: { value: new THREE.Vector3(.44, 1, 1) },
    uNewColor1: { value: new THREE.Vector3(2, 1.01, 2) }, uNewColor2: { value: new THREE.Vector3(.44, 1, 1) }, uColorLerp: { value: 1 },
  };
  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, side: THREE.DoubleSide, uniforms });
  scene.add(new THREE.Mesh(geometry, material));
  const target = new THREE.WebGLRenderTarget(1, 1, { format: THREE.RGBAFormat, stencilBuffer: false, depthBuffer: true });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  if (!c.mobilePipeline) {
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 1.2, .05, .07));
    if (!c.skipZeroBlur) {
      const h = new ShaderPass(horizontalBlurShader), v = new ShaderPass(verticalBlurShader);
      h.uniforms.h.value = 0; v.uniforms.v.value = 0;
      composer.addPass(h); composer.addPass(v);
    }
  }
  composer.addPass(new SMAAPass(1, 1));
  composer.addPass(new ShaderPass(transparent));
  const effective = c.mobileViewport ? Math.min(1, Math.max(.5, c.dpr * .5)) : Math.min(1.5, Math.max(.5, c.dpr));
  const buffer = Math.floor(c.size * effective);
  renderer.setPixelRatio(effective);
  renderer.setSize(c.size, c.size, false);
  if (c.fixDpr) { composer.setPixelRatio(effective); composer.setSize(c.size, c.size); }
  else composer.setSize(buffer, buffer);
  uniforms.uResolution.value.set(buffer, buffer);
  renderer.info.autoReset = false;
  const metadata = {
    canvas: [canvas.width, canvas.height], composer: [composer.renderTarget1.width, composer.renderTarget1.height],
    vertices: geometry.attributes.position.count, triangles: geometry.index.count / 3,
    geometryBytes: Object.values(geometry.attributes).reduce((n, a) => n + a.array.byteLength, geometry.index.array.byteLength),
    configuredPasses: composer.passes.length,
  };
  return { renderer, metadata, render(t) { uniforms.uTime.value = t / 1000; composer.render(); }, dispose() {
    for (const pass of composer.passes) pass.dispose?.();
    composer.dispose(); geometry.dispose(); material.dispose(); renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
  } };
}

function makeFog(c) {
  const el = document.createElement('div');
  Object.assign(el.style, { position: 'fixed', top: '0', left: '0', width: `${c.width}px`, height: `${c.height}px` });
  stage.append(el);
  const createFog = window.VANTA?.FOG || FOG.default || FOG;
  const effect = createFog({ el, THREE, mouseControls: true, touchControls: true, gyroControls: false,
    highlightColor: 0x1a6f83, midtoneColor: 0x145a6a, lowlightColor: 0x10604a, baseColor: 0x111111,
    blurFactor: .37, speed: .4, zoom: .7, scale: c.scale, scaleMobile: c.scale,
  });
  cancelAnimationFrame(effect.req);
  // The production library uses actual DPR / scale. Set the scenario DPR explicitly.
  effect.renderer.setPixelRatio(c.dpr / c.scale);
  effect.renderer.setSize(c.width, c.height);
  effect.uniforms.iResolution.value.set(c.width / c.scale, c.height / c.scale);
  if (c.virtualHeight) {
    cropFogShader(effect, THREE);
    const crop = getFogViewport(c.width, c.height, c.virtualHeight, c.dpr, c.scale);
    effect.uniforms.iResolution.value.set(...crop.resolution);
    effect.uniforms.uFogCoordinateScale.value.set(...crop.coordinateScale);
    effect.uniforms.uFogViewportOffset.value.set(...crop.offset);
  }
  const renderer = effect.renderer;
  renderer.info.autoReset = false;
  const metadata = { canvas: [renderer.domElement.width, renderer.domElement.height], triangles: 2, scale: c.scale, modeledPageHeight: c.height };
  return { renderer, metadata, render(t) {
    // Vanta schedules one extra resize after initialization; retain the explicit scenario DPR after it runs.
    if (renderer.getPixelRatio() !== c.dpr / c.scale) {
      renderer.setPixelRatio(c.dpr / c.scale);
      renderer.setSize(c.width, c.height);
    }
    effect.uniforms.iResolution.value.set(c.width / c.scale, (c.virtualHeight || c.height) / c.scale);
    effect.uniforms.iTime.value = t / 1000 * .4; renderer.render(effect.scene, effect.camera);
  }, dispose() {
    effect.destroy(); renderer.dispose(); renderer.forceContextLoss(); el.remove();
  } };
}

async function measure(config, round) {
  output.textContent = `Running ${config.name}, round ${round + 1}...`;
  const initStart = performance.now();
  const effect = config.kind === 'fog' ? makeFog(config) : makeTorus(config);
  const setupMs = performance.now() - initStart;
  const gl = effect.renderer.getContext();
  // Time actual GL work without the browser's swapchain/presentation waits.
  // Preserve the final buffer's dimensions and MSAA count; exclude compositor/presentation cost.
  const samples = gl.getContextAttributes().antialias ? gl.getParameter(gl.SAMPLES) : 0;
  const presentationTarget = new THREE.WebGLRenderTarget(gl.drawingBufferWidth, gl.drawingBufferHeight, { samples });
  const setRenderTarget = effect.renderer.setRenderTarget.bind(effect.renderer);
  effect.renderer.setRenderTarget = (target, ...args) => setRenderTarget(target === null ? presentationTarget : target, ...args);
  effect.renderer.setRenderTarget(null);
  const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
  const debug = gl.getExtension('WEBGL_debug_renderer_info');
  const gpu = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  for (let i = 0; i < 60; i++) effect.render(await nextFrame());
  const cpu = [], intervals = [], gpuTimes = [], queue = [], calls = [], triangles = [];
  let previous = null, disjoint = false;
  const poll = () => {
    if (!ext) return;
    if (gl.getParameter(ext.GPU_DISJOINT_EXT)) disjoint = true;
    while (queue.length && gl.getQueryParameter(queue[0], gl.QUERY_RESULT_AVAILABLE)) {
      const query = queue.shift();
      gpuTimes.push(gl.getQueryParameter(query, gl.QUERY_RESULT) / 1e6);
      gl.deleteQuery(query);
    }
  };
  for (let i = 0; i < 180; i++) {
    const t = await nextFrame();
    if (previous !== null) intervals.push(t - previous);
    previous = t;
    poll();
    effect.renderer.info.reset();
    const query = ext ? gl.createQuery() : null;
    if (query) gl.beginQuery(ext.TIME_ELAPSED_EXT, query);
    const start = performance.now();
    effect.render(t);
    cpu.push(performance.now() - start);
    if (query) { gl.endQuery(ext.TIME_ELAPSED_EXT); queue.push(query); }
    calls.push(effect.renderer.info.render.calls);
    triangles.push(effect.renderer.info.render.triangles);
  }
  for (let i = 0; queue.length && i < 60; i++) { await nextFrame(); poll(); }
  for (const query of queue) gl.deleteQuery(query);
  const result = { name: config.name, round, config, setupMs, gpu, timerSupported: !!ext, disjoint, ...effect.metadata,
    actualCanvasAfterWarmup: [gl.drawingBufferWidth, gl.drawingBufferHeight],
    measurement: 'offscreen-render-work-excludes-browser-presentation', presentationSamples: samples,
    cpuSubmissionMs: summary(cpu), gpuMs: disjoint ? null : summary(gpuTimes), frameIntervalMs: summary(intervals),
    drawCalls: percentile(calls, .5), submittedTriangles: percentile(triangles, .5), };
  effect.renderer.setRenderTarget = setRenderTarget;
  setRenderTarget(null);
  presentationTarget.dispose();
  effect.dispose();
  await nextFrame();
  await fetch('/result', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(result) });
  return result;
}

const desktop = { kind: 'torus', size: 576, dpr: 2 };
const cases = [
  { ...desktop, name: 'torus-desktop-before' },
  { ...desktop, optimized: true, fixDpr: true, radial: 96, tubular: 192, skipZeroBlur: true, name: 'torus-desktop-after' },
  { kind: 'torus', size: 590, dpr: 3, mobileViewport: true, name: 'torus-phone-before' },
  { kind: 'torus', size: 590, dpr: 3, mobileViewport: true, optimized: true, fixDpr: true, radial: 96, tubular: 192, skipZeroBlur: true, name: 'torus-phone-after-retains-bloom-and-framing' },
  { kind: 'fog', width: 1440, height: 2880, dpr: 2, scale: 2, name: 'fog-desktop-before' },
  { kind: 'fog', width: 1440, height: 1080, virtualHeight: 2880, dpr: 2, scale: 2, name: 'fog-desktop-after-20pct-overscan' },
  { kind: 'fog', width: 390, height: 5000, dpr: 3, scale: 4, name: 'fog-phone-before-modeled-5000px' },
  { kind: 'fog', width: 390, height: 1013, virtualHeight: 5000, dpr: 3, scale: 4, name: 'fog-phone-after-20pct-overscan' },
];

async function verifyFogCrop() {
  const results = [];
  for (const config of [
    { kind: 'fog', width: 720, height: 1440, croppedHeight: 540, dpr: 1, scale: 1 },
    { kind: 'fog', width: 390, height: 5000, croppedHeight: 1013, dpr: 3, scale: 4 },
  ]) {
    const renderPixels = async (c) => {
      const effect = makeFog(c);
      await nextFrame(); await nextFrame();
      effect.render(8000); // Restore scenario DPR after Vanta's queued resize.
      const width = effect.renderer.domElement.width, height = effect.renderer.domElement.height;
      const target = new THREE.WebGLRenderTarget(width, height, { depthBuffer: false });
      effect.renderer.setRenderTarget(target);
      effect.render(8000);
      const pixels = new Uint8Array(width * height * 4);
      effect.renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
      effect.renderer.setRenderTarget(null);
      target.dispose(); effect.dispose();
      return { pixels, width, height };
    };
    const before = await renderPixels(config);
    const after = await renderPixels({ ...config, height: config.croppedHeight, virtualHeight: config.height });
    let max = 0, total = 0;
    const offset = (before.height - after.height) * before.width * 4;
    for (let i = 0; i < after.pixels.length; i++) {
      const difference = Math.abs(before.pixels[offset + i] - after.pixels[i]);
      max = Math.max(max, difference); total += difference;
    }
    const mean = total / after.pixels.length;
    results.push({ config, maxChannelDifference: max, meanChannelDifference: mean, passed: max <= 1 });
    if (max > 1) throw new Error(`Fog crop changed visible pixels: max ${max}, mean ${mean}`);
  }
  await fetch('/visual', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(results) });
}


document.querySelector('#run').onclick = async () => {
  document.querySelector('#run').disabled = true;
  const results = [];
  try {
    await verifyFogCrop();
    for (let round = 0; round < 2; round++) {
      for (const config of round ? [...cases].reverse() : cases) results.push(await measure(config, round));
    }
    output.textContent = 'Completed. Results saved to localhost server.\n\n' + results.map(r => `${r.name}: CPU ${r.cpuSubmissionMs.median?.toFixed(2)} ms; GPU ${r.gpuMs?.median?.toFixed(2) ?? 'unavailable'} ms; ${r.drawCalls} draws`).join('\n');
    await fetch('/complete', { method: 'POST' });
  } catch (error) {
    output.textContent = error.stack;
    await fetch('/error', { method: 'POST', body: error.stack });
  }
};
