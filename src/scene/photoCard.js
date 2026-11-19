import * as THREE from 'three'
import { shadowTexture } from './shapes'

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`

// Rounded print with a white border. The sketch sits underneath; the real photo
// rises from the bottom like liquid, with a glittering meniscus at the edge.
const frag = /* glsl */ `
  uniform sampler2D uSketch; uniform sampler2D uColor;
  uniform float uFill; uniform float uTime; uniform vec3 uGlow; uniform float uSheen; uniform float uBack;
  uniform vec2 uSize;
  varying vec2 vUv;
  float sdRound(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    float d = sdRound(p, uSize * 0.5, 0.09);
    float alpha = smoothstep(0.006, -0.006, d);
    if (alpha < 0.01) discard;
    if (uBack > 0.5) { gl_FragColor = vec4(vec3(0.93, 0.88, 0.88), alpha); return; }
    float border = 0.07;
    vec2 inner = uSize * 0.5 - border;
    float din = sdRound(p, inner, 0.05);
    vec2 iuv = (p + inner) / (inner * 2.0);
    vec3 sketch = texture2D(uSketch, iuv).rgb;
    vec3 photo = texture2D(uColor, iuv).rgb;
    float wave = 0.016 * sin(iuv.x * 15.0 + uTime * 2.2) + 0.008 * sin(iuv.x * 37.0 - uTime * 3.1);
    wave *= smoothstep(0.0, 0.08, uFill) * (1.0 - smoothstep(0.92, 1.0, uFill));
    float edge = uFill * 1.1 - 0.05 + wave;
    float filled = smoothstep(edge + 0.006, edge - 0.006, iuv.y);
    vec3 col = mix(sketch, photo, filled);
    float band = exp(-abs(iuv.y - edge) * 55.0) * step(0.002, uFill) * (1.0 - step(0.998, uFill));
    float spark = step(0.9, hash(floor(iuv * vec2(160.0, 210.0)) + floor(uTime * 8.0)));
    col += uGlow * band * 0.9 + vec3(1.0) * band * spark * 1.4;
    // white print border
    col = mix(vec3(1.0, 0.985, 0.98), col, smoothstep(0.004, -0.004, din));
    // soft sheen that slides as the card turns
    float s = smoothstep(0.08, 0.0, abs(vUv.x * 0.8 + vUv.y * 0.6 - uSheen));
    col = mix(col, vec3(1.0), s * 0.10);
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`

export function createPhotoCard(loader, name) {
  const W = 1.62, Hh = 2.12
  const group = new THREE.Group()
  const load = (url) => { const t = loader.load(url); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t }
  const uniforms = {
    uSketch: { value: load(`/img/${name}-sketch.jpg`) },
    uColor: { value: load(`/img/${name}-color.jpg`) },
    uFill: { value: 0 }, uTime: { value: 0 }, uSheen: { value: 0.5 }, uBack: { value: 0 },
    uGlow: { value: new THREE.Color('#ff8fbd') },
    uSize: { value: new THREE.Vector2(W, Hh) },
  }
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag, transparent: true, side: THREE.FrontSide })
  const front = new THREE.Mesh(new THREE.PlaneGeometry(W, Hh), mat)
  const backMat = new THREE.ShaderMaterial({ uniforms: { ...uniforms, uBack: { value: 1 } }, vertexShader: vert, fragmentShader: frag, transparent: true, side: THREE.BackSide })
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W, Hh), backMat)
  back.position.z = -0.012
  // a few stacked edges give the print some thickness
  const edgeMat = new THREE.ShaderMaterial({ uniforms: { ...uniforms, uBack: { value: 1 } }, vertexShader: vert, fragmentShader: frag, transparent: true, side: THREE.DoubleSide })
  for (let i = 1; i < 4; i++) { const e = new THREE.Mesh(front.geometry, edgeMat); e.position.z = -0.004 * i; group.add(e) }
  group.add(back, front)

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.9), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0.8 }))
  shadow.position.set(0.45, -Hh / 2 - 0.08, -0.4)
  shadow.rotation.x = -Math.PI / 2.4

  return {
    group, shadow, uniforms, H: Hh,
    setGlow(c) { uniforms.uGlow.value.set(c) },
  }
}
