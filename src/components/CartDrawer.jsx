import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useCart, money, checkoutUrl } from '../lib/cart'
import { img } from '../data/catalog'
import { gsap, lockScroll, reducedMotion, scrollToId } from '../lib/motion'

export default function CartDrawer() {
  const { items, subtotal, count, remove, setQty, open, setOpen } = useCart()
  const root = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [going, setGoing] = useState(false)

  useEffect(() => { if (open) { setMounted(true); lockScroll(true) } }, [open])

  useLayoutEffect(() => {
    if (!mounted || !open) return
    const rm = reducedMotion()
    const ctx = gsap.context(() => {
      gsap.fromTo('.cd__scrim', { opacity: 0 }, { opacity: 1, duration: rm ? 0 : 0.4 })
      gsap.fromTo('.cd__panel', { xPercent: 105 }, { xPercent: 0, duration: rm ? 0 : 0.8, ease: 'expo.out' })
      if (!rm) gsap.from('.cd__line', { x: 60, opacity: 0, stagger: 0.06, duration: 0.7, ease: 'expo.out', delay: 0.15 })
    }, root)
    root.current.querySelector('.cd__close')?.focus()
    return () => ctx.revert()
  }, [mounted, open])

  const close = (after) => {
    const done = () => { setMounted(false); setOpen(false); lockScroll(false); after?.() }
    if (reducedMotion()) return done()
    gsap.to(root.current.querySelector('.cd__panel'), { xPercent: 105, duration: 0.5, ease: 'expo.in' })
    gsap.to(root.current.querySelector('.cd__scrim'), { opacity: 0, duration: 0.5, onComplete: done })
  }

  useEffect(() => {
    if (!mounted) return
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!mounted) return null

  const checkout = () => {
    setGoing(true)
    window.location.href = checkoutUrl(items)
  }

  return (
    <div className="cd" ref={root} role="dialog" aria-modal="true" aria-label="Your bag">
      <div className="cd__scrim" onClick={() => close()} />
      <aside className="cd__panel" data-lenis-prevent>
        <div className="cd__head">
          <h2>Your bag <span>{count}</span></h2>
          <button className="cd__close" onClick={() => close()} aria-label="Close bag">
            <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cd__empty">
            <p>Your bag is empty. A name tumbler is the quickest gift to start with.</p>
            <button className="btn btn--accent" onClick={() => close(() => scrollToId('tumbler'))}>Browse pieces</button>
          </div>
        ) : (
          <>
            <ul className="cd__lines">
              {items.map((l) => (
                <li className="cd__line" key={l.key}>
                  <img src={img(l.product.images[0], true)} alt="" />
                  <div className="cd__info">
                    <h3>{l.product.name}</h3>
                    <dl>
                      {Object.entries(l.options).filter(([, v]) => v && String(v).trim()).map(([k, v]) => (
                        <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                      ))}
                    </dl>
                    <div className="cd__ctrl">
                      <div className="qty qty--sm">
                        <button onClick={() => setQty(l.key, l.qty - 1)} aria-label="One less">−</button>
                        <output>{l.qty}</output>
                        <button onClick={() => setQty(l.key, l.qty + 1)} aria-label="One more">+</button>
                      </div>
                      <button className="cd__remove" onClick={() => remove(l.key)}>Remove</button>
                    </div>
                  </div>
                  <span className="cd__price">{money(l.qty * l.product.price)}</span>
                </li>
              ))}
            </ul>
            <div className="cd__foot">
              <div className="cd__sub"><span>Subtotal</span><b>{money(subtotal)}</b></div>
              <p>Shipping and tax are added at checkout. Your personalization details travel with the order.</p>
              <button className="btn btn--ink btn--wide" onClick={checkout} disabled={going}>
                {going ? 'Opening secure checkout…' : 'Check out securely'}
              </button>
              <p className="cd__secure">Payments are handled by Shopify on ammiescreations.com.</p>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
