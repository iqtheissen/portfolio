// app/components/ThreeScene.js
"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import vertexShader from "../../shaders/vertex";
import fragmentShader from "../../shaders/fragment";
import { horizontalBlurShader } from "../../shaders/horizontalBlurShader";
import { verticalBlurShader } from "../../shaders/verticalBlurShader";

export default function ThreeScene({ onLoaded, progress = 0, activeSection, isMobile}) {
  const canvasRef = useRef(null);
  const mousePos = useRef(new THREE.Vector2(0.5, 0.5));

  const progressRef = useRef(progress);


  useEffect(() => {
    // Update the progress reference whenever the progress changes, but only if the active section is not "projects"
    progressRef.current = activeSection !== "projects" ? progress : 1;
  }, [progress, activeSection]);

  useEffect(() => {
    let composer, torus;
    let resizeObserver;
    let mouseMoveHandler = null;

    const initScene = async () => {
      const Main = await import("../../init/init");
      const canvas = canvasRef.current;
      const container = canvas.parentElement;

      Main.init(canvas);
      Main.controls.enabled = false;

      torus = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.3, 500, 500),
        new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          side: THREE.DoubleSide,
          uniforms: {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uMouseWorld: { value: new THREE.Vector3() },
            uResolution: { value: new THREE.Vector2() },
            uDisplace: { value: 1.2 },
            uSpread: { value: .5 },
            uNoise: { value: 16 },
            uMouseDistance: { value: 0 },
          },
        })
      );

      Main.scene.add(torus);

      const renderTarget = new THREE.WebGLRenderTarget(1, 1, {
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        depthBuffer: true,
      });
      composer = new EffectComposer(Main.gl, renderTarget);

      composer.addPass(new RenderPass(Main.scene, Main.camera));
      composer.addPass(
        new UnrealBloomPass(new THREE.Vector2(1, 1), 1.2, 0.05, 0.07)
      );
      const hBlurPass = new ShaderPass(horizontalBlurShader);
      const vBlurPass = new ShaderPass(verticalBlurShader);

  // Set initial blur strength based on current resolution (use safe fallback)
  hBlurPass.uniforms.h.value = 1.0 / Math.max(1, window.innerWidth);
  vBlurPass.uniforms.v.value = 1.0 / Math.max(1, window.innerHeight);

      composer.addPass(hBlurPass);
      composer.addPass(vBlurPass);

      composer.addPass(new SMAAPass(1, 1));
      composer.addPass(new ShaderPass(TransparentBackgroundShader));

      const resize = () => {
        const width = Math.max(1, container.clientWidth);
        const height = Math.max(1, container.clientHeight);

        const dpr = window.devicePixelRatio || 1;

        // Compute resolution scaling at runtime (don't rely on the prop capture)
        const isMobileNow = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
        const resolutionScale = isMobileNow ? 0.5 : 1;

        // Cap DPR to avoid huge buffers on high-DPI devices; allow slightly higher DPR on desktop
        const maxDpr = isMobileNow ? 1 : 1.5;
        const effectiveDpr = Math.min(maxDpr, Math.max(0.5, dpr * resolutionScale));

        // Use devicePixelRatio for the drawing buffer but scaled down
        const bufferW = Math.floor(width * effectiveDpr);
        const bufferH = Math.floor(height * effectiveDpr);

        canvas.width = bufferW;
        canvas.height = bufferH;

        // Update shader uniform with buffer size
        torus.material.uniforms.uResolution.value.set(bufferW, bufferH);

        // Renderer and composer sizes: GL size uses CSS size + effective DPR; composer uses buffer size
        Main.gl.setPixelRatio(effectiveDpr);
        Main.gl.setSize(width, height, false);
        composer.setSize(bufferW, bufferH);

        // Keep the canvas CSS size equal to the container so layout is stable
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        Main.camera.aspect = width / height;
        Main.camera.updateProjectionMatrix();
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);

      // keep handler reference in outer scope so cleanup can remove it reliably
      mouseMoveHandler = (e) => {
        const rect = canvas.getBoundingClientRect();

        const inside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        if (!inside) {
          mousePos.current.set(NaN, NaN);
          return;
        }

        const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        mousePos.current.set(ndcX, ndcY);
      };
      window.addEventListener("mousemove", mouseMoveHandler);

      const clock = new THREE.Clock();
      let first = true;

      const animate = () => {
        
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  torus.material.uniforms.uTime.value = t;
  torus.material.uniforms.uMouse.value.copy(mousePos.current);

  if (
    !Number.isNaN(mousePos.current.x) &&
    !Number.isNaN(mousePos.current.y)
  ) {
    const vector = new THREE.Vector3(
      mousePos.current.x,
      mousePos.current.y,
      0.5
    );
    vector.unproject(Main.camera);

    const dir = vector.sub(Main.camera.position).normalize();
    const distance = -Main.camera.position.z / dir.z;
    const mouseWorldPos = Main.camera.position
      .clone()
      .add(dir.multiplyScalar(distance));

    torus.material.uniforms.uMouseWorld.value.copy(mouseWorldPos);

    const torusCenter = new THREE.Vector3(0, 0, 0);
    const distToCenter = mouseWorldPos.distanceTo(torusCenter);
    torus.material.uniforms.uMouseDistance.value = distToCenter;
  } else {
    torus.material.uniforms.uMouseDistance.value = 9999;
  }

  // Blur intensity based on progress and buffer sizes (use canvas pixel buffer if available)
  const blurStrength = progressRef.current * 3.0;
  const bufW = canvas ? (canvas.width || window.innerWidth) : window.innerWidth;
  const bufH = canvas ? (canvas.height || window.innerHeight) : window.innerHeight;
  hBlurPass.uniforms.h.value = blurStrength / Math.max(1, bufW);
  vBlurPass.uniforms.v.value = blurStrength / Math.max(1, bufH);

  // --- Modify camera distance here ---         // Set this to your starting camera z-position
  const minDistance = 2;       // Closest camera distance
  const maxDistance = 2.6;      // Farthest camera distance

  const minDistanceMobile = 10
  const maxDistanceMobile = 20

  // Interpolate distance based on progress (0 to 1)
  const newZ = isMobile ? minDistanceMobile + (maxDistanceMobile - minDistanceMobile) * (1 - progressRef.current) : minDistance + (maxDistance - minDistance) * (1 - progressRef.current);
  Main.camera.position.z = newZ;
  Main.camera.updateProjectionMatrix();
  // ------------------------------------

  Main.controls.update();
  composer.render();

  if (first) {
    first = false;
    setTimeout(() => onLoaded?.(), 100);
  }
};
      animate();
    };

    initScene();

    return () => {
      resizeObserver?.disconnect();
      if (mouseMoveHandler) window.removeEventListener("mousemove", mouseMoveHandler);
    };
  }, [onLoaded]);

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
