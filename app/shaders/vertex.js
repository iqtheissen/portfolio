export default /*glsl*/`

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

uniform float uTime;
uniform float uDisplace;
uniform float uNoise;
uniform vec3 uMouseWorld;
uniform float uSpread;

#define PI 3.14159265358979
#define MOD3 vec3(.1031,.11369,.13787)

vec3 hash33(vec3 p3) {
    p3 = fract(p3 * MOD3);
    p3 += dot(p3, p3.yxz + 19.19);
    return -1.0 + 2.0 * fract(vec3(
        (p3.x + p3.y) * p3.z,
        (p3.x + p3.z) * p3.y,
        (p3.y + p3.z) * p3.x
    ));
}

float pnoise(vec3 p) {
    vec3 pi = floor(p);
    vec3 pf = p - pi;
    vec3 w = pf * pf * (3.0 - 2.0 * pf);

    return mix(
        mix(
            mix(dot(pf - vec3(0, 0, 0), hash33(pi + vec3(0, 0, 0))),
                dot(pf - vec3(1, 0, 0), hash33(pi + vec3(1, 0, 0))),
                w.x),
            mix(dot(pf - vec3(0, 0, 1), hash33(pi + vec3(0, 0, 1))),
                dot(pf - vec3(1, 0, 1), hash33(pi + vec3(1, 0, 1))),
                w.x),
            w.z),
        mix(
            mix(dot(pf - vec3(0, 1, 0), hash33(pi + vec3(0, 1, 0))),
                dot(pf - vec3(1, 1, 0), hash33(pi + vec3(1, 1, 0))),
                w.x),
            mix(dot(pf - vec3(0, 1, 1), hash33(pi + vec3(0, 1, 1))),
                dot(pf - vec3(1, 1, 1), hash33(pi + vec3(1, 1, 1))),
                w.x),
            w.z),
        w.y
    );
}

void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;

    // World-space position
    vec4 worldPos4 = modelMatrix * vec4(position, 1.0);
    vec3 worldPos = worldPos4.xyz;

    // Distance to mouse in world space
    float dist = distance(worldPos, uMouseWorld);

    float radius = 0.7;
    float strength = smoothstep(radius, 0.0, dist);

    // ⚠️ Reduce intensity of displacement near mouse
    float noise = pnoise(vec3(vUv * uNoise, uTime)) * uDisplace * 0.4;

    vec3 displaced = position + normal * noise * strength;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;
