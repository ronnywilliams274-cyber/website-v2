import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, lockScroll, reducedMotion } from '../lib/motion'

/**
 * Line-drawn tumbler that fills with pink glitter as the page loads,
 * with a percentage counter underneath (the reference's filling bottle).
 */
export default function Preloader({ progress, onDone }) {
  const root = useRef(null)
  const [shown, setShown] = useState(0)
  const [gone, setGone] = useState(false)
  const target = useRef(0)
  const started = useRef(performance.now())

  useEffect(() => { lockScroll(true) }, [])
  useEffect(() => { target.current = progress }, [progress])

  // ease the visible number toward real progress, never faster than ~1.6s overall
  useEffect(() => {
    let raf
    const tick = () => {
      const minTime = Math.min(1, (performance.now() - started.current) / 1600)
      const goal = Math.min(target.current, minTime)
      setShown((s) => {
        const n = s + (goal - s) * 0.12
        return goal >= 1 && n > 0.995 ? 1 : n
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useLayoutEffect(() => {
    if (shown < 1 || gone) return
    const rm = reducedMotion()
    const tl = gsap.timeline({ onComplete: () => { setGone(true); lockScroll(false) } })
    tl.to('.pre__tumbler', { y: -14, scale: 1.06, duration: 0.35, ease: 'power2.out' })
      .to('.pre__inner', { opacity: 0, y: -30, duration: rm ? 0 : 0.6, ease: 'power3.in' }, '+=0.15')
      .add(() => onDone?.(), '-=0.2')
      .to(root.current, { opacity: 0, duration: rm ? 0 : 0.7, ease: 'power2.out' }, '-=0.1')
    return () => tl.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown >= 1])

  if (gone) return null
  const pct = Math.round(shown * 100)
  const level = 196 - shown * 138 // svg y of the glitter surface

  return (
    <div className="pre" ref={root} aria-live="polite" aria-label={`Loading ${pct}%`}>
      <div className="pre__inner">
        <svg className="pre__tumbler" viewBox="0 0 120 220" aria-hidden="true">
          <defs>
            <clipPath id="pre-body"><path d="M27 58 L93 58 L88 196 Q88 202 82 202 L38 202 Q32 202 32 196 Z" /></clipPath>
            <pattern id="pre-glitter" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="#e94a86" />
              <circle cx="2" cy="3" r="0.9" fill="#fff" opacity="0.8" /><circle cx="7" cy="7" r="0.7" fill="#ffd1e3" />
            </pattern>
          </defs>
          <g clipPath="url(#pre-body)">
            <path className="pre__fill" fill="url(#pre-glitter)"
              d={`M20 ${level} q 10 -4 20 0 t 20 0 t 20 0 t 20 0 t 20 0 V 210 H 20 Z`} />
          </g>
          <path d="M27 58 L93 58 L88 196 Q88 202 82 202 L38 202 Q32 202 32 196 Z" fill="none" stroke="#2b1a16" strokeWidth="2.4" strokeLinejoin="round" />
          <rect x="24" y="44" width="72" height="14" rx="4" fill="#fff7f5" stroke="#2b1a16" strokeWidth="2.4" />
          <path d="M66 44 L72 6" stroke="#2b1a16" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M60 120 c-6 -7 -15 -1 -10 7 l10 9 l10 -9 c5 -8 -4 -14 -10 -7z" fill={shown > 0.45 ? '#fff' : '#d6336c'} />
        </svg>
        <p className="pre__brand">Ammie’s Creations</p>
        <p className="pre__title">Blank to Beautiful</p>
        <p className="pre__pct">{pct}%</p>
      </div>
    </div>
  )
}
