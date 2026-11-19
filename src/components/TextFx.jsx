import { useLayoutEffect, useRef } from 'react'
import { gsap, reducedMotion } from '../lib/motion'

/**
 * Headline whose letters swing up out of the page one by one, scrubbed by scroll
 * (the reference site's "Strawberry Gin" treatment).
 */
export function SwingTitle({ lines, as: Tag = 'h2', className = '', trigger, start = 'top 80%', end = 'top 30%' }) {
  const root = useRef(null)
  useLayoutEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(root.current.querySelectorAll('.ch'),
        { rotateX: -95, rotateY: 25, yPercent: 40, opacity: 0, filter: 'blur(6px)' },
        {
          rotateX: 0, rotateY: 0, yPercent: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.06, ease: 'power2.out',
          scrollTrigger: { trigger: trigger?.current || root.current, start, end, scrub: 0.8 },
        })
    }, root)
    return () => ctx.revert()
  }, [trigger, start, end])
  return (
    <Tag className={`swing ${className}`} ref={root} aria-label={lines.join(' ')}>
      {lines.map((l, i) => (
        <span className="swing__line" key={i} aria-hidden="true">
          {l.split(' ').map((w, j, all) => (
            <span key={j}>
              <span className="swing__word">{w.split('').map((c, k) => <span className="ch" key={k}>{c}</span>)}</span>
              {j < all.length - 1 ? ' ' : null}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  )
}

/** Paragraph that darkens word by word as you scroll through it. */
export function InkText({ text, className = '', trigger, start = 'top 75%', end = 'top 25%' }) {
  const root = useRef(null)
  useLayoutEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(root.current.querySelectorAll('.w'), { opacity: 0.22 }, {
        opacity: 1, stagger: 0.08, ease: 'none',
        scrollTrigger: { trigger: trigger?.current || root.current, start, end, scrub: true },
      })
    }, root)
    return () => ctx.revert()
  }, [trigger, start, end])
  return (
    <p className={`ink ${className}`} ref={root}>
      {text.split(' ').map((w, i) => <span className="w" key={i}>{w} </span>)}
    </p>
  )
}

/** Small pills that pop in one after another. */
export function Tags({ tags, trigger }) {
  const root = useRef(null)
  useLayoutEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(root.current.children, { y: 16, opacity: 0, scale: 0.9 }, {
        y: 0, opacity: 1, scale: 1, stagger: 0.12, ease: 'back.out(2)',
        scrollTrigger: { trigger: trigger?.current || root.current, start: 'top 45%', end: 'top 15%', scrub: 0.6 },
      })
    }, root)
    return () => ctx.revert()
  }, [trigger])
  return <ul className="tags" ref={root}>{tags.map((t) => <li key={t}>{t}</li>)}</ul>
}
