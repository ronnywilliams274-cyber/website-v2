import * as THREE from 'three'
import { heartGeometry, starGeometry, gemGeometry, softDotTexture, rand } from './shapes'

const dummy = new THREE.Object3D()

function instanced(geo, mat, count, colors, r) {
  const m = new THREE.InstancedMesh(geo, mat, count)
  m.frustumCulled = false
  const cs = colors.map((c) => new THREE.Color(c))
  for (let i = 0; i < count; i++) m.setColorAt(i, cs[Math.floor(r() * cs.length)])
  return m
}

/**
 * Objects that tumble down past the product, like the strawberries on the
 * reference site. `intensity` (0..1) grows them in; scroll speed pushes them.
 */
export function createRain({ kinds, seed = 1 }) {
  const r = rand(seed)
  const group = new THREE.Group()
  const sets = kinds.map((k) => {
    const mesh = instanced(k.geo, k.mat, k.count, k.colors, r)
    group.add(mesh)
    const items = Array.from({ length: k.count }, (_, i) => ({
      x: -0.12 + r() * 0.78, y: r() * 1.6 - 0.8, z: -2.5 + r() * 5.5,
      vy: 0.025 + r() * 0.05, rx: r() * 6, ry: r() * 6, sx: (r() - 0.5) * 2.2, sy: (r() - 0.5) * 2.2,
      s: k.size * (0.6 + r() * 0.8), gate: i / k.count, flat: k.flat,
    }))
    return { mesh, items }
  })
  return {
    group,
    update(view, dt, intensity, push, mobile) {
      sets.forEach(({ mesh, items }) => {
        items.forEach((it, i) => {
          it.y -= (it.vy + push * 0.9) * dt
          if (it.y < -0.75) { it.y += 1.5 }
          if (it.y > 0.75) { it.y -= 1.5 }
          it.rx += it.sx * dt; it.ry += it.sy * dt
          const vis = THREE.MathUtils.smoothstep(intensity * 1.15 - it.gate, 0, 0.15)
          const xf = mobile ? it.x * 1.6 - 0.48 : it.x
          dummy.position.set(xf * view.w, it.y * view.h, it.z)
          dummy.rotation.set(it.flat ? it.rx * 0.3 + 0.4 : it.rx, it.ry, it.flat ? Math.sin(it.rx) * 0.6 : 0)
          dummy.scale.setScalar(it.s * vis + 1e-4)
          dummy.updateMatrix()
          mesh.setMatrixAt(i, dummy.matrix)
        })
        mesh.instanceMatrix.needsUpdate = true
        mesh.visible = intensity > 0.001
      })
    },
  }
}

/** A cluster that travels across the screen with one of the "what goes into it" words. */
export function createFlock({ geo, mat, count, colors, size, seed, points }) {
  const r = rand(seed)
  const group = new THREE.Group()
  let mesh
  const items = Array.from({ length: count }, () => ({
    ox: (r() - 0.5) * 0.8, oy: (r() - 0.5) * 0.22, z: -1.5 + r() * 3.5, s: size * (0.5 + r()), rx: r() * 6, ry: r() * 6, w: r() * 6,
  }))
  if (points) {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    mesh = new THREE.Points(g, new THREE.PointsMaterial({ size: size, map: softDotTexture('rgba(255,255,255,0.9)'), transparent: true, depthWrite: false, opacity: 0.85 }))
  } else {
    mesh = instanced(geo, mat, count, colors, r)
  }
  mesh.frustumCulled = false
  group.add(mesh)
  // path from upper right to lower left, matching the CSS words
  const A = new THREE.Vector2(0.78, 0.3), B = new THREE.Vector2(-0.78, -0.3)
  return {
    group,
    update(view, t, p) {
      const on = p > 0 && p < 1
      mesh.visible = on
      if (!on) return
      const cx = A.x + (B.x - A.x) * p, cy = A.y + (B.y - A.y) * p
      const ang = Math.atan2(B.y - A.y, B.x - A.x)
      items.forEach((it, i) => {
        const lx = it.ox * Math.cos(ang) - it.oy * Math.sin(ang)
        const ly = it.ox * Math.sin(ang) + it.oy * Math.cos(ang)
        const x = (cx + lx) * view.w, y = (cy + ly + Math.sin(t * 1.3 + it.w) * 0.01) * view.h
        if (points) {
          const a = mesh.geometry.attributes.position
          a.setXYZ(i, x, y + Math.sin(t + it.w) * 0.05, it.z)
        } else {
          dummy.position.set(x, y, it.z)
          dummy.rotation.set(it.rx + t * 0.6, it.ry + t * 0.4, 0)
          dummy.scale.setScalar(it.s)
          dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix)
        }
      })
      if (points) mesh.geometry.attributes.position.needsUpdate = true
      else mesh.instanceMatrix.needsUpdate = true
    },
  }
}

export function buildParticles() {
  const glossy = (o = {}) => new THREE.MeshPhysicalMaterial({ roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1, ...o })
  const gemMat = new THREE.MeshStandardMaterial({ metalness: 0.85, roughness: 0.06, flatShading: true, envMapIntensity: 2.4 })
  const pearlMat = new THREE.MeshPhysicalMaterial({ roughness: 0.18, metalness: 0.1, iridescence: 1, iridescenceIOR: 1.6, clearcoat: 1, sheen: 1, sheenColor: new THREE.Color('#ffd6e8') })
  const heart = heartGeometry(), star = starGeometry(), gem = gemGeometry()
  const sphere = new THREE.SphereGeometry(0.5, 24, 16)
  const confetti = new THREE.BoxGeometry(1, 0.5, 0.04)

  const rains = {
    hearts: createRain({ seed: 3, kinds: [
      { geo: heart, mat: glossy(), count: 26, colors: ['#e94a86', '#ff7fb0', '#d6336c', '#ffc2da'], size: 0.26 },
      { geo: sphere, mat: pearlMat, count: 22, colors: ['#ffffff', '#ffe6f0'], size: 0.13 },
    ] }),
    gems: createRain({ seed: 5, kinds: [
      { geo: gem, mat: gemMat, count: 56, colors: ['#ffffff', '#ffffff', '#f3d9ff', '#ff9bd2', '#d8c7ff'], size: 0.2 },
      { geo: sphere, mat: pearlMat, count: 14, colors: ['#ffffff'], size: 0.1 },
    ] }),
    stars: createRain({ seed: 7, kinds: [
      { geo: star, mat: glossy(), count: 34, colors: ['#b5e655', '#ffffff', '#7cc242', '#e9ffc4'], size: 0.28 },
      { geo: sphere, mat: glossy({ roughness: 0.5 }), count: 12, colors: ['#fff27a'], size: 0.17 },
    ] }),
    confetti: createRain({ seed: 9, kinds: [
      { geo: confetti, mat: glossy({ metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide }), count: 60, colors: ['#e3b04b', '#f6d27a', '#ffffff', '#ff9a6b'], size: 0.17, flat: true },
      { geo: star, mat: glossy({ metalness: 0.6 }), count: 14, colors: ['#f2c24f'], size: 0.22 },
    ] }),
  }

  const flocks = [
    createFlock({ geo: sphere, mat: glossy(), count: 40, colors: ['#00aeef', '#ec008c', '#ffe600', '#231f20'], size: 0.11, seed: 21 }),
    createFlock({ geo: sphere, mat: glossy(), count: 40, colors: ['#ff6fae', '#7fd6ff', '#c18bff', '#ffd36b'], size: 0.12, seed: 23 }),
    createFlock({ geo: gem, mat: gemMat, count: 36, colors: ['#ffffff', '#ffc2e2', '#e2d2ff'], size: 0.17, seed: 25 }),
    createFlock({ count: 70, size: 0.9, seed: 27, points: true }),
  ]
  return { rains, flocks }
}
