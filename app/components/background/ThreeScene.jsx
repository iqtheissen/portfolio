// app/components/ThreeScene.js
"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { createGraphicsLoop } from "../../lib/graphicsLoop";
import vertexShader from "../../shaders/vertex";
import fragmentShader from "../../shaders/fragment";
import { horizontalBlurShader } from "../../shaders/horizontalBlurShader";
import { verticalBlurShader } from "../../shaders/verticalBlurShader";

export default function ThreeScene({ onLoaded, progress = 0, activeSection, selectedProject }) {
  const canvasRef = useRef(null);
  const mousePos = useRef(new THREE.Vector2(0.5, 0.5));
  const loopRef = useRef(null);
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;
  const currentProjectRef = useRef(selectedProject);
  const colorLerpRef = useRef({ startTime: 0, duration: 1000, isLerping: false });
  const torusUniformsRef = useRef(null);

  const progressRef = useRef(progress);


  useEffect(() => {
    progressRef.current = activeSection !== "projects" ? progress : 1;
    loopRef.current?.invalidate();
  }, [progress, activeSection]);

  // Handle project color changes with smooth lerping
  useEffect(() => {
    if (!selectedProject || !currentProjectRef.current || !torusUniformsRef.current) return;

    // If this is the first project or the project changed
    if (currentProjectRef.current.name !== selectedProject.name) {
      const uniforms = torusUniformsRef.current;

      // Set old colors to current colors
      const currentColor1 = uniforms.uDebugColor1.value;
      const currentColor2 = uniforms.uDebugColor2.value;

      uniforms.uOldColor1.value.copy(currentColor1);
      uniforms.uOldColor2.value.copy(currentColor2);

      // Set new colors from selected project
      if (selectedProject.color1 && selectedProject.color2) {
        uniforms.uNewColor1.value.set(...selectedProject.color1);
        uniforms.uNewColor2.value.set(...selectedProject.color2);
      }

      // Start lerping
      colorLerpRef.current = {
        startTime: Date.now(),
        duration: 1000, // 1 second lerp
        isLerping: true
      };

      currentProjectRef.current = selectedProject;
      loopRef.current?.invalidate();
    }
  }, [selectedProject]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    // Own these resources per mount. The old shared initializer leaked its RAF
    // and resize handler and could overwrite another mount's renderer.
    const renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: false, preserveDrawingBuffer: false,
    });
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.01, 100);
    camera.position.z = 2.6;
    const geometry = new THREE.TorusGeometry(1, 0.3, 96, 192);
    const material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader, side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseWorld: { value: new THREE.Vector3() },
        uResolution: { value: new THREE.Vector2() },
        uDisplace: { value: 1.2 },
        uSpread: { value: .5 },
        uNoise: { value: 16 },
        uMouseDistance: { value: 0 },
        uDebugColor1: { value: new THREE.Vector3(2, 1.01, 2) },
        uDebugColor2: { value: new THREE.Vector3(0.44, 1, 1) },
        uOldColor1: { value: new THREE.Vector3(2, 1.01, 2) },
        uOldColor2: { value: new THREE.Vector3(0.44, 1, 1) },
        uNewColor1: { value: new THREE.Vector3(2, 1.01, 2) },
        uNewColor2: { value: new THREE.Vector3(0.44, 1, 1) },
        uColorLerp: { value: 1.0 },
      },
    });
    const torus = new THREE.Mesh(geometry, material);
    const uniforms = material.uniforms;
    torusUniformsRef.current = uniforms;
    scene.add(torus);

    const target = new THREE.WebGLRenderTarget(1, 1, {
      format: THREE.RGBAFormat, stencilBuffer: false, depthBuffer: true,
    });
    const composer = new EffectComposer(renderer, target);
    composer.addPass(new RenderPass(scene, camera));
    // Retain the existing neon bloom on phones as well as desktop.
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 1.2, 0.05, 0.07));
    const hBlur = new ShaderPass(horizontalBlurShader);
    const vBlur = new ShaderPass(verticalBlurShader);
    composer.addPass(hBlur);
    composer.addPass(vBlur);
    composer.addPass(new SMAAPass(1, 1));
    composer.addPass(new ShaderPass(TransparentBackgroundShader));

    let previousSize = "";
    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      const mobile = window.matchMedia("(max-width: 768px)").matches;
      const dpr = Math.min(mobile ? 1 : 1.5,
        Math.max(0.5, (window.devicePixelRatio || 1) * (mobile ? 0.5 : 1)));
      const size = `${width}:${height}:${dpr}`;
      if (size === previousSize) return;
      previousSize = size;
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      // EffectComposer accepts CSS dimensions and applies its own DPR once.
      composer.setPixelRatio(dpr);
      composer.setSize(width, height);
      uniforms.uResolution.value.set(canvas.width, canvas.height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      loopRef.current?.invalidate();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener("resize", resize);
    resize();

    const mouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom) {
        mousePos.current.set(NaN, NaN);
      } else {
        mousePos.current.set(((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1);
      }
      loopRef.current?.invalidate();
    };
    window.addEventListener("mousemove", mouseMove);

    const mouseWorld = new THREE.Vector3();
    const start = performance.now();
    let first = true;
    let loadedTimeout;
    const loop = createGraphicsLoop(canvas, (time, delta, reducedMotion) => {
      uniforms.uTime.value = reducedMotion ? 0 : (time - start) / 1000;
      uniforms.uMouse.value.copy(mousePos.current);

      if (colorLerpRef.current.isLerping) {
        const elapsed = Date.now() - colorLerpRef.current.startTime;
        const amount = reducedMotion ? 1 : Math.min(elapsed / colorLerpRef.current.duration, 1);
        uniforms.uColorLerp.value = amount;
        if (amount >= 1) {
          colorLerpRef.current.isLerping = false;
          uniforms.uDebugColor1.value.copy(uniforms.uNewColor1.value);
          uniforms.uDebugColor2.value.copy(uniforms.uNewColor2.value);
        }
      }
      // Preserve the framing that was actually displayed on both layouts;
      // the old mobile branch was captured before the media query resolved.
      camera.position.z = 2 + 0.6 * (1 - progressRef.current);
      camera.updateMatrixWorld();
      if (Number.isFinite(mousePos.current.x) && Number.isFinite(mousePos.current.y)) {
        mouseWorld.set(mousePos.current.x, mousePos.current.y, 0.5).unproject(camera);
        mouseWorld.sub(camera.position).normalize();
        mouseWorld.multiplyScalar(-camera.position.z / mouseWorld.z).add(camera.position);
        uniforms.uMouseWorld.value.copy(mouseWorld);
        uniforms.uMouseDistance.value = mouseWorld.length();
      } else {
        uniforms.uMouseDistance.value = 9999;
      }
      const blurStrength = progressRef.current * 3;
      hBlur.enabled = vBlur.enabled = blurStrength > 0;
      hBlur.uniforms.h.value = blurStrength / Math.max(1, canvas.width);
      vBlur.uniforms.v.value = blurStrength / Math.max(1, canvas.height);
      composer.render();
      if (first) {
        first = false;
        loadedTimeout = setTimeout(() => onLoadedRef.current?.(), 100);
      }
    });
    loopRef.current = loop;

    return () => {
      loop.destroy();
      loopRef.current = null;
      clearTimeout(loadedTimeout);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", mouseMove);
      torusUniformsRef.current = null;
      for (const pass of composer.passes) pass.dispose?.();
      composer.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      className="cursor-target"
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        position: "absolute",
        inset: 0,
        background: "transparent",
        pointerEvents: "auto",
      }}
    />
  );
}

const TransparentBackgroundShader = {
  uniforms: {
    tDiffuse: { value: null },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      if (c.r < .08 && c.g < .08 && c.b < .08) c.a = 0.;
      gl_FragColor = c;
    }
  `,
};
