import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PRODUCTS, img } from '../data/catalog'
import { useCart, money } from '../lib/cart'
import { gsap, lockScroll, reducedMotion } from '../lib/motion'

function Field({ f, value, onChange, error }) {
  const id = `f-${f.key.replace(/\W+/g, '-')}`
  return (
    <div className={`fld ${error ? 'has-error' : ''}`}>
      <label htmlFor={f.type === 'chips' ? undefined : id} id={`${id}-l`}>
        {f.key}{f.required ? <em> required</em> : null}
      </label>
      {f.type === 'chips' && (
        <div className="chips" role="radiogroup" aria-labelledby={`${id}-l`}>
          {f.options.map((o) => (
            <button type="button" key={o} role="radio" aria-checked={value === o}
              className={`chip ${value === o ? 'is-on' : ''}`} onClick={() => onChange(o)}>{o}</button>
          ))}
        </div>
      )}
      {f.type === 'text' && (
        <input id={id} value={value || ''} maxLength={f.max} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {f.type === 'area' && (
        <textarea id={id} rows={3} value={value || ''} maxLength={f.max} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {error && <p className="fld__err">{error}</p>}
    </div>
  )
}

export default function ProductSheet({ sheet, onClose }) {
  const product = sheet ? PRODUCTS.find((p) => p.id === sheet.id) : null
  const { add } = useCart()
  const root = useRef(null)
  const panel = useRef(null)
  const mainImg = useRef(null)
  const [shown, setShown] = useState(null)
  const [active, setActive] = useState(0)
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (product) {
      setShown(product); setActive(0); setValues(sheet.preset || {}); setErrors({}); setQty(1)
      lockScroll(true)
    }
  }, [product, sheet])

  useLayoutEffect(() => {
    if (!shown || !root.current) return
    const rm = reducedMotion()
    const ctx = gsap.context(() => {
      gsap.fromTo('.ps__scrim', { opacity: 0 }, { opacity: 1, duration: rm ? 0 : 0.4 })
      gsap.fromTo(panel.current, { clipPath: 'inset(100% 0 0 0 round 28px)' }, { clipPath: 'inset(0% 0 0 0 round 28px)', duration: rm ? 0 : 0.9, ease: 'expo.out' })
      if (!rm) gsap.from('.ps__form > *', { y: 30, opacity: 0, stagger: 0.04, duration: 0.7, ease: 'expo.out', delay: 0.15 })
    }, root)
    panel.current.querySelector('button, input')?.focus({ preventScroll: true })
    return () => ctx.revert()
  }, [shown])

  const close = () => {
    const done = () => { setShown(null); lockScroll(false); onClose() }
    if (reducedMotion()) return done()
    gsap.to(panel.current, { clipPath: 'inset(0 0 100% 0 round 28px)', duration: 0.5, ease: 'expo.in' })
    gsap.to(root.current.querySelector('.ps__scrim'), { opacity: 0, duration: 0.5, onComplete: done })
  }

  useEffect(() => {
    if (!shown) return
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!shown) return null
  const p = shown

  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    p.fields.forEach((f) => { if (f.required && !String(values[f.key] || '').trim()) errs[f.key] = f.type === 'chips' ? `Choose a ${f.key.toLowerCase()}.` : `Add the ${f.key.toLowerCase()} so Ammie can print it.` })
    setErrors(errs)
    if (Object.keys(errs).length) return

    add(p.id, values, qty)
    // fly a copy of the photo into the bag button
    const from = mainImg.current.getBoundingClientRect()
    const to = document.getElementById('bag-button')?.getBoundingClientRect()
    if (to && !reducedMotion()) {
      const ghost = mainImg.current.cloneNode()
      Object.assign(ghost.style, { position: 'fixed', left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, objectFit: 'cover', borderRadius: '24px', zIndex: 200, pointerEvents: 'none' })
      document.body.appendChild(ghost)
      gsap.to(ghost, {
        left: to.left + to.width / 2 - 20, top: to.top + to.height / 2 - 20, width: 40, height: 40, borderRadius: '50%', rotate: 25,
        duration: 0.85, ease: 'power3.in', onComplete: () => ghost.remove(),
      })
    }
    close()
  }

  return (
    <div className="ps" ref={root} role="dialog" aria-modal="true" aria-label={p.name}>
      <div className="ps__scrim" onClick={close} />
      <div className="ps__panel" ref={panel} data-lenis-prevent>
        <button className="ps__close" onClick={close} aria-label="Close">
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <div className="ps__media">
          <img ref={mainImg} key={active} className="ps__main" src={img(p.images[active])} alt={`${p.name}, example made by Ammie`} />
          <div className="ps__thumbs">
            {p.images.map((im, i) => (
              <button key={im} className={i === active ? 'is-on' : ''} onClick={() => setActive(i)} aria-label={`Show photo ${i + 1}`}>
                <img src={img(im, true)} alt="" />
              </button>
            ))}
          </div>
        </div>
        <form className="ps__form" onSubmit={submit} noValidate>
          <p className="ps__kind">{p.kind}, {p.method}</p>
          <h2>{p.name}</h2>
          <p className="ps__price">{money(p.price)}</p>
          <ul className="ps__details">{p.details.map((d) => <li key={d}>{d}</li>)}</ul>
          {p.fields.map((f) => (
            <Field key={f.key} f={f} value={values[f.key]} error={errors[f.key]}
              onChange={(v) => { setValues((s) => ({ ...s, [f.key]: v })); setErrors((s) => ({ ...s, [f.key]: undefined })) }} />
          ))}
          <div className="ps__buy">
            <div className="qty" aria-label="Quantity">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="One less">−</button>
              <output aria-live="polite">{qty}</output>
              <button type="button" onClick={() => setQty((q) => Math.min(50, q + 1))} aria-label="One more">+</button>
            </div>
            <button className="btn btn--accent btn--wide" type="submit">Add to bag, {money(p.price * qty)}</button>
          </div>
          <p className="ps__fine">Photos can be sent after checkout by replying to your order email or messaging Ammie on Facebook.</p>
        </form>
      </div>
    </div>
  )
}
