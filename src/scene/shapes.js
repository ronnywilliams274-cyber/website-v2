import * as THREE from 'three'

export function heartGeometry() {
  const s = new THREE.Shape()
  s.moveTo(0, -0.5)
  s.bezierCurveTo(-0.15, -0.35, -0.55, -0.1, -0.5, 0.18)
  s.bezierCurveTo(-0.45, 0.48, -0.08, 0.52, 0, 0.25)
  s.bezierCurveTo(0.08, 0.52, 0.45, 0.48, 0.5, 0.18)
  s.bezierCurveTo(0.55, -0.1, 0.15, -0.35, 0, -0.5)
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 4, curveSegments: 18 })
  g.center()
  return g
}

export function starGeometry(points = 5, inner = 0.42) {
  const s = new THREE.Shape()
  for (let i = 0; i <= points * 2; i++) {
    const r = i % 2 ? inner : 1
    const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2
    const x = Math.cos(a) * r * 0.5, y = Math.sin(a) * r * 0.5
    i ? s.lineTo(x, y) : s.moveTo(x, y)
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 2 })
  g.center()
  return g
}

export function gemGeometry() {
  // brilliant-ish cut: a low crown on a deeper pavilion
  const g = new THREE.CylinderGeometry(0.5, 0.0, 0.62, 8, 1)
  const crown = new THREE.CylinderGeometry(0.32, 0.5, 0.2, 8, 1)
  crown.translate(0, 0.41, 0)
  const merged = mergeGeometries([g, crown])
  merged.computeVertexNormals()
  return merged
}

function mergeGeometries(list) {
  const geos = list.map((g) => g.toNonIndexed())
  const pos = [], nor = []
  geos.forEach((g) => { pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array) })
  const out = new THREE.BufferGeometry()
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  return out
}

export function softDotTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const c = document.createElement('canvas'); c.width = c.height = 128
  const x = c.getContext('2d')
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, inner); g.addColorStop(0.35, inner.replace(/[\d.]+\)$/, '0.6)')); g.addColorStop(1, outer)
  x.fillStyle = g; x.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function shadowTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128
  const x = c.getContext('2d')
  const g = x.createRadialGradient(128, 64, 4, 128, 64, 120)
  g.addColorStop(0, 'rgba(70,30,30,0.55)'); g.addColorStop(0.5, 'rgba(70,30,30,0.18)'); g.addColorStop(1, 'rgba(70,30,30,0)')
  x.save(); x.scale(1, 0.5); x.fillStyle = g; x.fillRect(0, 0, 256, 256); x.restore()
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function rand(seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}
