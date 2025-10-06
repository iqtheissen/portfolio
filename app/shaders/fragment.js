export default /*glsl*/ `

varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPattern;

uniform vec2 uResolution;
uniform float uTime;
uniform float uDisplace;
uniform float uSpread;
uniform float uNoise;

uniform vec3 uOldColor1;
uniform vec3 uOldColor2;
uniform vec3 uNewColor1;
uniform vec3 uNewColor2;
uniform float uColorLerp;

#define PI 3.14159265358979
#define MOD3 vec3(.1031,.11369,.13787)

vec3 hash33(vec3 p3) {
    p3 = fract(p3 * MOD3);
    p3 += dot(p3, p3.yxz+19.19);
    return -1.0 + 2.0 * fract(vec3(
        (p3.x + p3.y)*p3.z,
        (p3.x + p3.z)*p3.y,
        (p3.y + p3.z)*p3.x));
}

float pnoise(vec3 p) {
    vec3 pi = floor(p);
    vec3 pf = p - pi;
    vec3 w = pf * pf * (3. - 2.0 * pf);
    return mix(
        mix(
            mix(dot(pf - vec3(0,0,0), hash33(pi + vec3(0,0,0))),
                dot(pf - vec3(1,0,0), hash33(pi + vec3(1,0,0))),
                w.x),
            mix(dot(pf - vec3(0,0,1), hash33(pi + vec3(0,0,1))),
                dot(pf - vec3(1,0,1), hash33(pi + vec3(1,0,1))),
                w.x),
            w.z),
        mix(
            mix(dot(pf - vec3(0,1,0), hash33(pi + vec3(0,1,0))),
                dot(pf - vec3(1,1,0), hash33(pi + vec3(1,1,0))),
                w.x),
            mix(dot(pf - vec3(0,1,1), hash33(pi + vec3(0,1,1))),
                dot(pf - vec3(1,1,1), hash33(pi + vec3(1,1,1))),
                w.x),
            w.z),
        w.y);
}

// Helper to linearly interpolate between two colors
vec3 lerp(vec3 a, vec3 b, float t) {
    return a + t * (b - a);
}

// Define your color palette with vibrancy boost via division by small vectors
const int NUM_COLORS = 4;
vec3 palette[NUM_COLORS];

void initPalette() {
    palette[0] = vec3(0.6, 0.3, 0.9)   / vec3(0.5, 0.5, 0.05);  // Vibrant Purple
    palette[1] = vec3(0.95, 0.25, 0.65) / vec3(0.8, 0.4, 0.1);  // Bright Pink
    palette[2] = vec3(0.1, 0.45, 1.0)  / vec3(0.1, 0.3, 0.6);   // Electric Blue
    palette[3] = vec3(1.0, 0.2, 0.2)   / vec3(0.8, 0.1, 0.05);  // Intense Red
}

vec3 cyclePalette(float time) {
    float cycleSpeed = 0.2; // control speed of cycling
    float t = time * cycleSpeed;

    int index0 = int(floor(t)) % NUM_COLORS;
    int index1 = (index0 + 1) % NUM_COLORS;
    float frac = fract(t);

    return lerp(palette[index0], palette[index1], frac);
}

vec3 debugPalette() {
    vec3 lerpedColor1 = mix(uOldColor1, uNewColor1, uColorLerp);
    vec3 lerpedColor2 = mix(uOldColor2, uNewColor2, uColorLerp);
    return lerpedColor1 / lerpedColor2;
}

void main() {
    initPalette();

    float pat = pnoise(vec3(vUv * uNoise , sin(uTime) * 1.4 )) * uDisplace;
    float proximity = abs(vUv.x - (.5 + sin(uTime)/(12. * uSpread)));

    vec3 full = pat * vec3(clamp(.23 * uSpread  - proximity , 0., 1.));
    vec3 newPosition = vPosition + vNormal * full; 

    vec3 cyclingColor = cyclePalette(uTime);

    vec3 debugColor = debugPalette();

    vec3 color = -vec3(pnoise(vec3(1. - newPosition.z * 35.)) * 40.) * (.01 - full) * debugColor;

    gl_FragColor = vec4(color, 1.);
}
`
