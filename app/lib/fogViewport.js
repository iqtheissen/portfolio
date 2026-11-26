// Crop the original page-sized fog field rather than stretching a smaller
// field. The offset accounts for WebGL's bottom-left fragment coordinates.
export function getFogViewport(width, height, virtualHeight, deviceDpr, scale) {
  const originalDpr = deviceDpr / scale;
  const renderDpr = Math.min(originalDpr, 1);
  const bufferWidth = Math.max(1, Math.floor(width * renderDpr));
  const bufferHeight = Math.max(1, Math.floor(height * renderDpr));
  const sourceWidth = Math.floor(width * originalDpr);
  const sourceHeight = Math.floor(virtualHeight * originalDpr);
  const coordinateScale = [sourceWidth / bufferWidth, originalDpr / renderDpr];
  return {
    renderDpr,
    resolution: [width / scale, virtualHeight / scale],
    coordinateScale,
    offset: [0, sourceHeight - bufferHeight * coordinateScale[1]],
  };
}

export function cropFogShader(effect, THREE) {
  effect.uniforms.uFogCoordinateScale = { value: new THREE.Vector2(1, 1) };
  effect.uniforms.uFogViewportOffset = { value: new THREE.Vector2() };
  for (const mesh of effect.scene.children) {
    if (!mesh.material?.fragmentShader) continue;
    mesh.material.fragmentShader = `uniform vec2 uFogCoordinateScale;
uniform vec2 uFogViewportOffset;
${mesh.material.fragmentShader.replaceAll("gl_FragCoord.xy", "(gl_FragCoord.xy * uFogCoordinateScale + uFogViewportOffset)")}`;
    mesh.material.needsUpdate = true;
  }
}
