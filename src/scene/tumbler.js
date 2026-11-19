import * as THREE from 'three'
import { rand } from './shapes'

const WRAP = ['#ffc7dd', '#f7a8c8', '#e94a86', '#b8235e']

function paintWrap(ctx, w, h, name) {
  const r = rand(7)
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, WRAP[0]); g.addColorStop(0.35, WRAP[1]); g.addColorStop(0.75, WRAP[2]); g.addColorStop(1, WRAP[3])
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 9000; i++) {
    const y = Math.pow(r(), 0.6) * h, x = r() * w, s = r() * 3.2 + 0.6
    ctx.fillStyle = r() > 0.55 ? `rgba(255,255,255,${0.25 + r() * 0.6})` : `rgba(255,214,235,${0.2 + r() * 0.5})`
    ctx.fillRect(x, y, s, s)
  }
  const heart = (x, y, s) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = 'rgba(255,255,255,0.88)'
    ctx.beginPath(); ctx.moveTo(0, 6); ctx.bezierCurveTo(-10, -2, -6, -12, 0, -6); ctx.bezierCurveTo(6, -12, 10, -2, 0, 6); ctx.fill(); ctx.restore()
  }
  for (let i = 0; i < 40; i++) {
    const x = r() * w, y = r() * h
    if (Math.abs(x - w / 2) < w * 0.2 && Math.abs(y - h * 0.5) < h * 0.22) continue
    heart(x, y, 1.6 + r() * 2.6)
  }
  const label = (name || 'Your name').slice(0, 16)
  let size = 300
  ctx.font = `${size}px "DM Serif Display", Georgia, serif`
  while (ctx.measureText(label).width > w * 0.32 && size > 60) { size -= 6; ctx.font = `${size}px "DM Serif Display", Georgia, serif` }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'
  ctx.shadowColor = 'rgba(80,0,30,0.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10
  ctx.lineWidth = size * 0.14; ctx.strokeStyle = '#ffffff'; ctx.strokeText(label, w / 2, h * 0.5)
  ctx.shadowColor = 'transparent'; ctx.fillStyle = '#2b1a16'; ctx.fillText(label, w / 2, h * 0.5)
  ctx.font = `500 40px "Inter Variable", sans-serif`; ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.fillText('made with love by Ammie', w / 2, h * 0.5 + size * 0.6 + 30)
}

/**
 * A 20oz skinny tumbler that starts as a white sublimation blank.
 * uFill raises the printed wrap from the bottom with a wavy, glowing edge.
 */
export function createTumbler(renderer) {
  const group = new THREE.Group()
  const H = 2.6, RT = 0.5, RB = 0.42

  const canvas = document.createElement('canvas'); canvas.width = 2048; canvas.height = 1880
  const ctx = canvas.getContext('2d')
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
  let name = 'Ammie'
  const repaint = () => { paintWrap(ctx, canvas.width, canvas.height, name); tex.needsUpdate = true }
  repaint()
  document.fonts?.load?.('300px "DM Serif Display"').then(repaint).catch(() => {})

  const uniforms = {
    uFill: { value: 0 }, uTime: { value: 0 },
    uBlank: { value: new THREE.Color('#f6f1f2') }, uGlow: { value: new THREE.Color('#ff7fb0') },
  }
  const bodyMat = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.28, metalness: 0.12, clearcoat: 1, clearcoatRoughness: 0.06 })
  bodyMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms)
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uFill; uniform float uTime; uniform vec3 uBlank; uniform vec3 uGlow; float fillBand;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        float wave = 0.014 * sin(vMapUv.x * 18.85 + uTime * 2.4) + 0.007 * sin(vMapUv.x * 43.98 - uTime * 3.3);
        float edge = uFill * 1.08 - 0.04 + wave * smoothstep(0.0, 0.08, uFill) * (1.0 - smoothstep(0.92, 1.0, uFill));
        float filled = smoothstep(edge + 0.004, edge - 0.004, vMapUv.y);
        diffuseColor.rgb = mix(uBlank, diffuseColor.rgb, filled);
        fillBand = exp(-abs(vMapUv.y - edge) * 70.0) * step(0.002, uFill) * (1.0 - step(0.998, uFill));`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float spark = step(0.92, fract(sin(dot(floor(vMapUv * vec2(240.0, 200.0)), vec2(12.9898, 78.233)) + uTime) * 43758.5453));
        totalEmissiveRadiance += uGlow * fillBand * (0.9 + spark * 2.0);`)
  }
  const body = new THREE.Mesh(new THREE.CylinderGeometry(RT, RB, H, 128, 1, true, Math.PI, Math.PI * 2), bodyMat)
  group.add(body)

  const steel = new THREE.MeshStandardMaterial({ color: '#e9e6ea', metalness: 1, roughness: 0.18 })
  const base = new THREE.Mesh(new THREE.CylinderGeometry(RB, RB * 0.97, 0.06, 96), steel)
  base.position.y = -H / 2 - 0.03; group.add(base)
  const lip = new THREE.Mesh(new THREE.CylinderGeometry(RT * 1.005, RT * 1.005, 0.14, 96, 1, true), steel)
  lip.position.y = H / 2 + 0.07; group.add(lip)
  // dark interior so the open top reads as a cup when the lid pops
  const inside = new THREE.Mesh(new THREE.CircleGeometry(RT * 0.98, 64), new THREE.MeshStandardMaterial({ color: '#b9aeb2', metalness: 0.9, roughness: 0.35 }))
  inside.rotation.x = -Math.PI / 2; inside.position.y = H / 2 - 0.02; group.add(inside)

  const lid = new THREE.Group()
  const clear = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, transmission: 1, thickness: 0.3, ior: 1.45, transparent: true, opacity: 0.6 })
  const lidBody = new THREE.Mesh(new THREE.CylinderGeometry(RT * 1.03, RT * 1.03, 0.2, 96), clear)
  const lidRing = new THREE.Mesh(new THREE.TorusGeometry(RT * 0.92, 0.035, 16, 96), clear)
  lidRing.rotation.x = Math.PI / 2; lidRing.position.y = 0.1
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 24), new THREE.MeshPhysicalMaterial({ color: '#ff8fbd', roughness: 0.1, transmission: 0.5, thickness: 0.1, transparent: true, opacity: 0.92 }))
  straw.position.set(0.12, 0.62, -0.05); straw.rotation.z = -0.08
  lid.add(lidBody, lidRing, straw)
  lid.position.y = H / 2 + 0.24
  group.add(lid)

  // the glitter pour: a ribbon of sparkle that falls into the open tumbler
  const pc = document.createElement('canvas'); pc.width = 64; pc.height = 512
  const px = pc.getContext('2d'); const r = rand(11)
  const pg = px.createLinearGradient(0, 0, 64, 0)
  pg.addColorStop(0, 'rgba(233,74,134,0)'); pg.addColorStop(0.25, 'rgba(240,90,150,0.95)'); pg.addColorStop(0.75, 'rgba(240,90,150,0.95)'); pg.addColorStop(1, 'rgba(233,74,134,0)')
  px.fillStyle = pg; px.fillRect(0, 0, 64, 512)
  for (let i = 0; i < 700; i++) { px.fillStyle = `rgba(255,255,255,${0.4 + r() * 0.6})`; px.fillRect(14 + r() * 36, r() * 512, 1.5 + r() * 2, 1.5 + r() * 2) }
  const pourTex = new THREE.CanvasTexture(pc); pourTex.wrapT = THREE.RepeatWrapping; pourTex.colorSpace = THREE.SRGBColorSpace
  const pourGeo = new THREE.PlaneGeometry(0.16, 1); pourGeo.translate(0, -0.5, 0)
  const pour = new THREE.Mesh(pourGeo, new THREE.MeshBasicMaterial({ map: pourTex, transparent: true, depthWrite: false }))
  pour.visible = false
  group.add(pour)

  const LID_Y = H / 2 + 0.24
  const TOP = H / 2 + 4.5

  return {
    group, H, uniforms,
    setName(n) { name = n; repaint() },
    update(st, t) {
      uniforms.uFill.value = st.fill
      uniforms.uTime.value = t
      const l = st.lid
      lid.position.set(1.1 * l, LID_Y + 2.6 * l - 0.9 * l * l, 0.4 * l)
      lid.rotation.set(1.3 * l, 0, -3.2 * l)
      lid.visible = l < 0.98
      // stream: head falls from above, tail follows it down when the pour ends
      const reach = TOP - (H / 2 - 0.2)
      const head = TOP - st.pourIn * reach
      const tail = TOP - st.pourOut * reach
      const len = tail - head
      pour.visible = len > 0.02
      if (pour.visible) {
        pour.position.set(0, tail, 0.02)
        pour.scale.y = len
        pourTex.repeat.set(1, len / 1.2)
        pourTex.offset.y = t * 2.2
      }
    },
    dispose() { tex.dispose(); pourTex.dispose() },
  }
}
