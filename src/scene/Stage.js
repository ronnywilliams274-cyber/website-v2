import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { createTumbler } from './tumbler'
import { createPhotoCard } from './photoCard'
import { buildParticles } from './particles'
import { CHAPTERS } from '../data/story'

/** Everything the scroll choreography animates. Positions are viewport fractions. */
export function createState() {
  const obj = (o) => ({ x: 0.22, y: 0, s: 1, ry: 0, rz: 0, ...o })
  return {
    tumbler: obj({ fill: 0, lid: 0, pourIn: 0, pourOut: 0, y: -0.04 }),
    jacket: obj({ y: 1.3, fill: 0, rz: 0.2 }),
    jersey: obj({ y: 1.3, fill: 0, rz: -0.2 }),
    senior: obj({ y: 1.3, fill: 0, rz: 0.2 }),
    fx: { hearts: 0, gems: 0, stars: 0, confetti: 0 },
    flocks: [0, 0, 0, 0],
    hidden: false,
    intro: 0, // 0..1 page reveal after the preloader
    lineup: 0, // 0..1 closing line-up (phones switch from stacked to row layout)
  }
}

export function createStage(canvas, state, onProgress) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60)
  camera.position.set(0, 0, 8)
  const key = new THREE.DirectionalLight('#fff3f0', 2.2); key.position.set(3, 4, 5)
  const rim = new THREE.DirectionalLight('#ff8fb4', 2.4); rim.position.set(-4, 1, -3)
  scene.add(key, rim, new THREE.AmbientLight('#ffe6ea', 0.45))

  const manager = new THREE.LoadingManager()
  manager.onProgress = (_, loaded, total) => onProgress?.(loaded / total)
  const loader = new THREE.TextureLoader(manager)

  const tumbler = createTumbler(renderer)
  scene.add(tumbler.group)
  const cards = {}
  CHAPTERS.filter((c) => c.image).forEach((c) => {
    const card = createPhotoCard(loader, c.image)
    card.setGlow(c.accent)
    card.group.add(card.shadow)
    scene.add(card.group)
    cards[c.id] = card
  })
  const tShadow = cards.jacket.shadow.clone()
  tShadow.position.set(0.5, -tumbler.H / 2 - 0.05, -0.2)
  tumbler.group.add(tShadow)

  const { rains, flocks } = buildParticles()
  Object.values(rains).forEach((r) => scene.add(r.group))
  flocks.forEach((f) => scene.add(f.group))

  const view = { w: 1, h: 1, mobile: false }
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    view.mobile = w / h < 0.85
    camera.position.z = view.mobile ? 10.5 : 8
    camera.updateProjectionMatrix()
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z
    view.h = halfH * 2; view.w = view.h * camera.aspect
  }
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize()

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
  const onMove = (e) => { mouse.tx = e.clientX / innerWidth - 0.5; mouse.ty = e.clientY / innerHeight - 0.5 }
  window.addEventListener('pointermove', onMove, { passive: true })

  let lastScroll = window.scrollY, push = 0
  const place = (g, st, t, bob = 0, base = 1) => {
    let x = st.x, y = st.y, s = st.s * base
    if (view.mobile) {
      // phones: pieces live in the top third above the copy; the finale spreads them into a row
      const k = state.lineup
      const onStage = Math.abs(x) < 0.4 && y > -0.6 && y < 0.6
      const mx = onStage ? x * 0.1 : x, my = onStage ? y * 0.6 + 0.29 : y, ms = onStage ? s * 0.66 : s
      x = mx + (x * 1.3 - mx) * k
      y = my + (y + 0.12 - my) * k
      s = ms + (s * 0.6 - ms) * k
    }
    g.position.set(x * view.w, y * view.h + Math.sin(t * 1.1 + bob) * 0.05, 0)
    g.rotation.set(mouse.y * 0.12, st.ry + mouse.x * 0.45, st.rz)
    g.scale.setScalar(s * (0.85 + 0.15 * state.intro))
    g.visible = Math.abs(x) < 1.1 && Math.abs(y) < 1.15
  }

  const timer = new THREE.Timer()
  let raf = 0, running = true
  const frame = () => {
    raf = requestAnimationFrame(frame)
    if (!running) return
    if (state.hidden) { if (canvas.style.visibility !== 'hidden') canvas.style.visibility = 'hidden'; return }
    if (canvas.style.visibility === 'hidden') canvas.style.visibility = 'visible'
    timer.update()
    const dt = Math.min(timer.getDelta(), 0.05), t = timer.getElapsed()
    mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05
    const sy = window.scrollY
    push += ((sy - lastScroll) / innerHeight * 6 - push) * 0.15
    lastScroll = sy

    place(tumbler.group, state.tumbler, t, 0, 0.74)
    tumbler.update(state.tumbler, t)
    ;['jacket', 'jersey', 'senior'].forEach((id, i) => {
      const c = cards[id]; const st = state[id]
      place(c.group, st, t, i + 1, 1.12)
      c.uniforms.uFill.value = st.fill
      c.uniforms.uTime.value = t
      c.uniforms.uSheen.value = 0.6 + (st.ry + mouse.x * 0.45) * 0.6
    })
    Object.entries(rains).forEach(([k, r]) => r.update(view, dt, state.fx[k], push, view.mobile))
    flocks.forEach((f, i) => f.update(view, t, state.flocks[i]))
    renderer.render(scene, camera)
  }
  frame()

  const onVis = () => { running = !document.hidden }
  document.addEventListener('visibilitychange', onVis)

  return {
    setName: tumbler.setName,
    compile: () => renderer.compile(scene, camera),
    dispose() {
      cancelAnimationFrame(raf); ro.disconnect()
      window.removeEventListener('pointermove', onMove); document.removeEventListener('visibilitychange', onVis)
      tumbler.dispose(); pmrem.dispose(); renderer.dispose()
    },
  }
}
