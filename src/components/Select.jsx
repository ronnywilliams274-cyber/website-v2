import { useEffect, useId, useRef, useState } from 'react'
import { gsap, reducedMotion } from '../lib/motion'

/** Glass dropdown select with full keyboard support (listbox pattern). */
export default function Select({ value, onChange, options, labelledBy, className = '' }) {
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(Math.max(0, options.indexOf(value)))
  const root = useRef(null)
  const list = useRef(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    setHi(Math.max(0, options.indexOf(value)))
    gsap.fromTo(list.current, { opacity: 0, y: -8, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: reducedMotion() ? 0 : 0.35, ease: 'expo.out' })
    const onDoc = (e) => { if (!root.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', onDoc)
    return () => document.removeEventListener('pointerdown', onDoc)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (open) list.current?.children[hi]?.scrollIntoView({ block: 'nearest' }) }, [hi, open])

  const choose = (o) => { onChange(o); setOpen(false); root.current.querySelector('button').focus() }
  const onKey = (e) => {
    if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault()
      if (!open) { setOpen(true); return }
      setHi((h) => (e.key === 'ArrowDown' ? Math.min(options.length - 1, h + 1) : Math.max(0, h - 1)))
    }
    if ((e.key === 'Enter' || e.key === ' ') && open) { e.preventDefault(); choose(options[hi]) }
    if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false) }
  }

  return (
    <div className={`sel ${open ? 'is-open' : ''} ${className}`} ref={root} onKeyDown={onKey}>
      <button type="button" className="sel__btn" aria-haspopup="listbox" aria-expanded={open} aria-labelledby={`${labelledBy} ${id}-v`} onClick={() => setOpen((o) => !o)}>
        <span id={`${id}-v`}>{value}</span>
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" /></svg>
      </button>
      {open && (
        <ul className="sel__list glass" role="listbox" ref={list} aria-labelledby={labelledBy} data-lenis-prevent
          aria-activedescendant={`${id}-${hi}`} tabIndex={-1}>
          {options.map((o, i) => (
            <li key={o} id={`${id}-${i}`} role="option" aria-selected={o === value}
              className={`${i === hi ? 'is-hi' : ''} ${o === value ? 'is-on' : ''}`}
              onMouseEnter={() => setHi(i)} onClick={() => choose(o)}>
              {o}
              {o === value && <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17 19 7" /></svg>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
