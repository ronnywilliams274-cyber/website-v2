import { useEffect, useRef } from 'react'
import { gsap } from '../lib/motion'

/** A small dot with a trailing ring that swells over anything clickable. */
export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    document.documentElement.classList.add('has-cursor')
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.12 }), dy = gsap.quickTo(dot.current, 'y', { duration: 0.12 })
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.5, ease: 'power3.out' }), ry = gsap.quickTo(ring.current, 'y', { duration: 0.5, ease: 'power3.out' })
    const move = (e) => {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY)
      const hot = e.target.closest?.('a, button, input, select, textarea, [role="radio"]')
      ring.current.classList.toggle('is-hot', !!hot)
    }
    const leave = () => gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.2 })
    const enter = () => gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.2 })
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave); document.addEventListener('pointerenter', enter)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave); document.removeEventListener('pointerenter', enter)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])
  return (
    <>
      <div className="cur cur--ring" ref={ring} aria-hidden="true" />
      <div className="cur cur--dot" ref={dot} aria-hidden="true" />
    </>
  )
}
