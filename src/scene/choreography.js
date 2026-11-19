import { gsap } from '../lib/motion'
import { START as S, TOTAL, CHAPTERS } from '../data/story'

/**
 * The scroll story as a pure function of scroll position.
 *
 * Every value (3D state, flying words, giant words, colours) is computed fresh
 * from `v` (how many viewport-heights down the page we are) on every frame, so
 * scrolling backwards always lands in exactly the same state as scrolling forwards.
 */
const cl = (x) => (x < 0 ? 0 : x > 1 ? 1 : x)
const seg = (v, a, b) => cl((v - a) / (b - a))
const lerp = (a, b, t) => a + (b - a) * t
const E = {
  inOut: (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
  out: (p) => 1 - Math.pow(1 - p, 3),
  in: (p) => p * p,
}

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mixHex = (a, b, t) => {
  const A = hex(a), B = hex(b)
  return '#' + A.map((x, i) => Math.round(lerp(x, B[i], t)).toString(16).padStart(2, '0')).join('')
}

const BASE = { bg: '#f7e1dd', accent: '#d6336c' }
const CH = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]))
const I = S.intro, TM = S.tumbler, M = S.making, J = S.jacket, JE = S.jersey, SE = S.senior, C = S.closing
const L = C - 90 // line-up starts

// colour keyframes: [v, bg, accent]
const COLORS = [
  [0, BASE.bg, BASE.accent],
  [J - 30, BASE.bg, BASE.accent],
  [J + 20, CH.jacket.bg, CH.jacket.accent],
  [JE - 30, CH.jacket.bg, CH.jacket.accent],
  [JE + 20, CH.jersey.bg, CH.jersey.accent],
  [SE - 30, CH.jersey.bg, CH.jersey.accent],
  [SE + 20, CH.senior.bg, CH.senior.accent],
  [L, CH.senior.bg, CH.senior.accent],
  [L + 60, '#f8e3d9', BASE.accent],
]
function colorAt(v) {
  for (let i = 1; i < COLORS.length; i++) {
    const [v1, b1, a1] = COLORS[i]
    if (v <= v1) {
      const [v0, b0, a0] = COLORS[i - 1]
      const t = E.inOut(seg(v, v0, v1))
      return [mixHex(b0, b1, t), mixHex(a0, a1, t)]
    }
  }
  return [COLORS.at(-1)[1], COLORS.at(-1)[2]]
}

const LINE = { tumbler: [-0.27, 0.62], jacket: [-0.09, 0.5], jersey: [0.09, 0.5], senior: [0.27, 0.5] }
const ORDER = ['jacket', 'jersey', 'senior']
const FX = { jacket: 'gems', jersey: 'stars', senior: 'confetti' }

export function computeState(state, v) {
  const after = Math.max(0, v - C) / 100 // viewports scrolled past the story
  const fadeOut = 1 - seg(v, C, C + 60)
  const line = E.out(seg(v, L, L + 80))
  state.lineup = line

  // ---------- tumbler ----------
  const T = state.tumbler
  const toCentre = E.inOut(seg(v, M - 30, M + 20))
  const exit = E.in(seg(v, J - 45, J + 15))
  T.lid = E.out(seg(v, I + 6, I + 38)) * (1 - E.inOut(seg(v, TM + 14, TM + 48)))
  T.pourIn = E.in(seg(v, I + 24, I + 50))
  T.pourOut = E.in(seg(v, TM - 10, TM + 14))
  T.fill = seg(v, I + 40, I + 145)
  let x = lerp(0.22, 0, toCentre), y = -0.04, s = lerp(1, 1.12, toCentre), rz = 0
  let ry = 0.565 * E.inOut(seg(v, I + 20, I + 140)) * (1 - toCentre) + Math.PI * 2 * seg(v, M + 10, M + 290)
  x = lerp(x, 0.95, exit); y = lerp(y, -0.75, exit); s = lerp(s, 0.9, exit); rz = lerp(rz, -0.4, exit)
  const lt = E.out(seg(v, L, L + 80))
  x = lerp(x, LINE.tumbler[0], lt); y = lerp(y, 0.19, lt); s = lerp(s, LINE.tumbler[1], lt); rz = lerp(rz, 0, lt)
  ry = lerp(ry, Math.PI * 2, lt)
  Object.assign(T, { x, y: y + after * 1.05, s, rz, ry })

  // ---------- print cards ----------
  ORDER.forEach((id, i) => {
    const st = state[id], start = S[id], next = ORDER[i + 1]
    const enter = E.out(seg(v, start - 20, start + 40))
    let cx = 0.22, cy = lerp(1.3, 0, enter), cs = 1, crz = lerp(i % 2 ? -0.2 : 0.2, 0, enter)
    let cry = lerp(-0.7, 0.12, E.out(seg(v, start - 20, start + 50)))
    if (next) {
      const ex = E.in(seg(v, S[next] - 20, S[next] + 40))
      cx = lerp(cx, 0.95, ex); cy = lerp(cy, -0.8, ex); crz = lerp(crz, -0.35, ex); cs = lerp(cs, 0.9, ex)
    }
    const lp = E.out(seg(v, L + (i + 1) * 4, L + (i + 1) * 4 + 80))
    cx = lerp(cx, LINE[id][0], lp); cy = lerp(cy, 0.19, lp); cs = lerp(cs, LINE[id][1], lp); crz = lerp(crz, 0, lp); cry = lerp(cry, 0, lp)
    Object.assign(st, { x: cx, y: cy + after * 1.05, s: cs, rz: crz, ry: cry, fill: seg(v, start + 30, start + 125) })
  })

  // ---------- falling things ----------
  const fx = state.fx
  fx.hearts = (seg(v, I + 20, I + 70) * (1 - seg(v, J - 45, J - 5)) + 0.35 * seg(v, L, L + 60)) * fadeOut
  ORDER.forEach((id, i) => {
    const start = S[id], next = ORDER[i + 1]
    let k = seg(v, start - 10, start + 40)
    k *= next ? 1 - seg(v, S[next] - 20, S[next] + 20) : 1 - 0.65 * seg(v, L, L + 60)
    fx[FX[id]] = k * fadeOut
  })

  // ---------- "what goes into it" flocks ----------
  for (let i = 0; i < 4; i++) state.flocks[i] = seg(v, M + 8 + i * 58, M + 8 + i * 58 + 112)

  state.hidden = v > C + 140
  return { after, fadeOut, line }
}

/** DOM side of the story: flying words, giant background words, caption, colours. */
export function createDomDriver() {
  const root = document.documentElement
  const words = [...document.querySelectorAll('.mw')]
  const bgw = Object.fromEntries([...document.querySelectorAll('.bgw__w')].map((el) => [el.dataset.id, el]))
  const cap = document.querySelector('.making__cap')
  let lastBg = '', lastAccent = ''

  return (v) => {
    const W = innerWidth, H = innerHeight
    words.forEach((el, i) => {
      const p = seg(v, M + 8 + i * 58, M + 8 + i * 58 + 112)
      const o = p <= 0 || p >= 1 ? 0 : Math.min(1, p / 0.07, (1 - p) / 0.07)
      el.style.visibility = o > 0 ? 'visible' : 'hidden'
      el.style.opacity = o
      el.style.transform = `translate3d(${lerp(0.85, -0.85, p) * W}px, ${lerp(-0.32, 0.32, p) * H}px, 0)`
    })

    // giant words: tumbler first, then one per chapter
    const set = (el, o, sc) => { el.style.opacity = o; el.style.transform = `scale(${sc})`; el.style.visibility = o > 0.002 ? 'visible' : 'hidden' }
    const tOut = seg(v, M - 30, M + 10)
    set(bgw.tumbler, 1 - tOut, lerp(1, 0.9, tOut))
    ORDER.forEach((id, i) => {
      const inn = seg(v, S[id] - 10, S[id] + 40)
      const out = ORDER[i + 1] ? seg(v, S[ORDER[i + 1]] - 40, S[ORDER[i + 1]]) : seg(v, L, L + 40)
      set(bgw[id], inn * (1 - out), lerp(1.1, 1, inn) * lerp(1, 0.9, out))
    })

    if (cap) {
      const o = seg(v, M - 10, M + 10) * (1 - seg(v, J - 40, J - 20))
      cap.style.opacity = o; cap.style.visibility = o > 0 ? 'visible' : 'hidden'
    }

    const [bg, accent] = v > C + 60 ? [BASE.bg, BASE.accent] : colorAt(v)
    if (bg !== lastBg) { root.style.setProperty('--bg', bg); lastBg = bg }
    if (accent !== lastAccent) { root.style.setProperty('--accent', accent); lastAccent = accent }
  }
}

/** Drives everything from Lenis/scroll each frame with a little extra easing (like scrub: 1). */
export function startChoreography(state, onChapter) {
  const dom = createDomDriver()
  let shown = window.scrollY / innerHeight * 100
  let lastChapter = ''
  const chapters = [['hero', 0], ['intro', I], ['tumbler', TM - 30], ['making', M - 30], ['jacket', J - 30], ['jersey', JE - 30], ['senior', SE - 30], ['closing', C - 60], ['store', C + 70]]
  const tick = () => {
    const target = window.scrollY / innerHeight * 100
    shown += (target - shown) * 0.14
    if (Math.abs(target - shown) > 120) shown = target - Math.sign(target - shown) * 120 // big jumps catch up fast
    if (Math.abs(target - shown) < 0.01) shown = target
    computeState(state, shown)
    dom(shown)
    let ch = 'hero'
    for (const [id, at] of chapters) if (target >= at) ch = id
    if (ch !== lastChapter) { lastChapter = ch; onChapter?.(ch, target) }
  }
  gsap.ticker.add(tick)
  tick()
  return () => gsap.ticker.remove(tick)
}

export { TOTAL }
