import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap, lockScroll, reducedMotion, scrollToId } from '../lib/motion'
import { QUOTES, STORE, PRODUCTS, OCCASIONS, img } from '../data/catalog'
import { money } from '../lib/cart'
import { toast } from './Toast'
import Select from './Select'

/** Shared glass pop-up shell: blurred scrim, springy card, Escape / outside click close, focus trap. */
export function Popup({ open, onClose, label, className = '', children }) {
  const root = useRef(null)
  const [shown, setShown] = useState(open)
  const opener = useRef(null)

  useEffect(() => { if (open) { opener.current = document.activeElement; setShown(true) } }, [open])

  useLayoutEffect(() => {
    if (!shown || !root.current) return
    const rm = reducedMotion()
    const ctx = gsap.context(() => {
      if (open) {
        lockScroll(true)
        gsap.fromTo('.pop__scrim', { opacity: 0 }, { opacity: 1, duration: rm ? 0 : 0.45 })
        gsap.fromTo('.pop__card', { opacity: 0, y: 50, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: rm ? 0 : 0.7, ease: 'expo.out' })
      } else {
        gsap.to('.pop__card', { opacity: 0, y: 30, scale: 0.97, duration: rm ? 0 : 0.3, ease: 'power3.in' })
        gsap.to('.pop__scrim', {
          opacity: 0, duration: rm ? 0 : 0.35,
          onComplete: () => { setShown(false); lockScroll(false); opener.current?.focus?.({ preventScroll: true }) },
        })
      }
    }, root)
    if (open) root.current.querySelector('[data-autofocus], .pop__card input, .pop__card button:not(.pop__close)')?.focus({ preventScroll: true })
    return () => ctx.kill()
  }, [open, shown])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const f = [...root.current.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')].filter((x) => !x.disabled)
        if (!f.length) return
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus() }
        else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!shown) return null
  return createPortal(
    <div className={`pop ${className}`} ref={root} role="dialog" aria-modal="true" aria-label={label}>
      <div className="pop__scrim" onClick={onClose} />
      <div className="pop__card glass" data-lenis-prevent>
        <button className="pop__close" onClick={onClose} aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
        {children}
      </div>
    </div>,
    document.body
  )
}

const QUOTE_ITEMS = [...PRODUCTS.map((p) => p.name), ...QUOTES.map((q) => q.name), 'Something else']

/** Quote request: builds a tidy message, copies it, opens Messenger. */
export function QuotePopup({ open, preset, onClose }) {
  const [v, setV] = useState({ item: QUOTES[0].name, qty: '1', date: '', details: '', name: '' })
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!open) return
    const pr = typeof preset === 'object' && preset ? preset : { item: preset }
    setV((s) => ({
      ...s,
      item: pr.item && QUOTE_ITEMS.includes(pr.item) ? pr.item : pr.item ? 'Something else' : s.item,
      qty: pr.qty ? String(pr.qty) : s.qty,
      date: pr.when || s.date,
      details: pr.item && !QUOTE_ITEMS.includes(pr.item) && !s.details ? `Something like: ${pr.item}` : s.details,
    }))
    setCopied(false)
  }, [open, preset])
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target ? e.target.value : e }))
  const message = `Hi Ammie! I'd like a quote.\nItem: ${v.item}\nQuantity: ${v.qty}${v.date ? `\nNeeded by: ${v.date}` : ''}${v.details ? `\nDetails: ${v.details}` : ''}${v.name ? `\nName: ${v.name}` : ''}`
  const send = async (e) => {
    e.preventDefault()
    try { await navigator.clipboard.writeText(message); setCopied(true) } catch { setCopied(false) }
    window.open(STORE.messenger, '_blank', 'noopener')
  }
  return (
    <Popup open={open} onClose={onClose} label="Request a quote" className="pop--quote">
      <form className="qform" onSubmit={send}>
        <p className="eyebrow">Made to order</p>
        <h2>Request a quote</h2>
        <p className="qform__lead">Tell Ammie what you need. We’ll copy your request so you can paste it straight into Messenger.</p>
        <div className="qform__grid">
          <div className="qform__field qform__item">
            <span className="qform__label" id="q-item">What would you like?</span>
            <Select labelledBy="q-item" value={v.item} onChange={set('item')} options={QUOTE_ITEMS} />
          </div>
          <label className="qform__field">How many?<input type="number" min="1" max="500" value={v.qty} onChange={set('qty')} /></label>
          <label className="qform__field">Needed by<input type="date" value={v.date} onChange={set('date')} /></label>
          <label className="qform__field">Your name<input value={v.name} onChange={set('name')} placeholder="Optional" autoComplete="name" /></label>
          <label className="qform__field qform__full">Names, colors, wording, photos you have
            <textarea rows={4} value={v.details} onChange={set('details')} placeholder="e.g. 12 shirts for the Bees softball team, green and gold, names on the back" />
          </label>
        </div>
        <div className="qform__preview" aria-label="Message preview"><pre>{message}</pre></div>
        <button className="btn btn--accent btn--wide" type="submit">Copy request and open Messenger</button>
        <p className="qform__note" aria-live="polite">{copied ? 'Copied. Paste it into the Messenger chat that just opened.' : 'Messenger opens in a new tab.'}</p>
      </form>
    </Popup>
  )
}

/** "Join the glitter list": shows once, on exit intent (desktop) or after a long visit. */
export function NewsletterPopup({ ready }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!ready) return
    let seen = false
    try { seen = localStorage.getItem('ammies-news') === '1' } catch { /* ignore */ }
    if (seen) return
    const show = () => setOpen(true)
    const t = setTimeout(show, 60000)
    const onLeave = (e) => { if (e.clientY <= 0 && window.scrollY > innerHeight * 2) show() }
    document.addEventListener('mouseout', onLeave)
    return () => { clearTimeout(t); document.removeEventListener('mouseout', onLeave) }
  }, [ready])
  const close = () => { setOpen(false); try { localStorage.setItem('ammies-news', '1') } catch { /* ignore */ } }
  return (
    <Popup open={open} onClose={close} label="Join the glitter list" className="pop--news">
      <div className="news">
        <img className="news__art" src={img('brand-ammie')} alt="" />
        <div>
          <p className="eyebrow">Before you go</p>
          <h2>Join the glitter list</h2>
          <p className="news__p">New designs, seasonal drops and the occasional deal, straight from Ammie. No spam, just sparkle.</p>
          <NewsletterForm onDone={close} />
          <button className="news__no" onClick={close}>No thanks</button>
        </div>
      </div>
    </Popup>
  )
}

/** Posts to Shopify's own customer list. Shopify may finish with a quick check in a new tab. */
export function NewsletterForm({ onDone, compact }) {
  return (
    <form className={`newsform ${compact ? 'newsform--compact' : ''}`} action={`${STORE.shopifyDomain}/contact#contact_form`} method="post" target="_blank" acceptCharset="UTF-8"
      onSubmit={() => { toast('Thanks! Finish signing up in the new tab'); onDone?.() }}>
      <input type="hidden" name="form_type" value="customer" />
      <input type="hidden" name="utf8" value="✓" />
      <input type="hidden" name="contact[tags]" value="newsletter,website-v2" />
      <label className="sr" htmlFor={compact ? 'nf-email-c' : 'nf-email'}>Email</label>
      <input id={compact ? 'nf-email-c' : 'nf-email'} type="email" name="contact[email]" required placeholder="you@email.com" autoComplete="email" />
      <button className="btn btn--accent" type="submit">Sign me up</button>
    </form>
  )
}

/** Lightbox with captions, arrows, keyboard and swipe. */
export function Lightbox({ items, index, onClose, onIndex, onQuote }) {
  const open = index !== null && index !== undefined
  const it = open ? items[index] : null
  const touch = useRef(null)
  const go = (d) => onIndex((index + d + items.length) % items.length)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  return (
    <Popup open={open} onClose={onClose} label="Photo viewer" className="pop--lb">
      {it && (
        <figure className="lb" onTouchStart={(e) => { touch.current = e.touches[0].clientX }}
          onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1) }}>
          <div className="lb__img"><img key={it.image} src={img(it.image)} alt={it.caption} /></div>
          <figcaption>
            <div className="lb__cap"><b>{it.caption}</b><small>{index + 1} of {items.length} · a real order by Ammie</small></div>
            <div className="lb__ctrl">
              <button onClick={() => go(-1)} aria-label="Previous photo"><svg viewBox="0 0 24 24"><path d="M15 5 8 12l7 7" /></svg></button>
              <button onClick={() => go(1)} aria-label="Next photo"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg></button>
              <button className="btn btn--accent btn--sm" onClick={() => { onClose(); onQuote(it.caption) }}>Order something like this</button>
            </div>
          </figcaption>
          <div className="lb__strip">
            {items.map((x, i) => (
              <button key={x.image} className={i === index ? 'is-on' : ''} onClick={() => onIndex(i)} aria-label={`Show ${x.caption}`}>
                <img src={img(x.image, true)} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </figure>
      )}
    </Popup>
  )
}

/** Ctrl/Cmd+K search across pieces, made-to-order items, occasions and sections. */
export function SearchPopup({ open, onClose, onOpenProduct, onQuote }) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  useEffect(() => { if (open) { setQ(''); setActive(0) } }, [open])
  const all = useMemo(() => [
    ...PRODUCTS.map((p) => ({ kind: 'Piece', label: p.name, sub: money(p.price), image: p.images[0], run: () => onOpenProduct(p.id) })),
    ...QUOTES.map((x) => ({ kind: 'Made to order', label: x.name, sub: x.from, image: x.image, run: () => onQuote(x.name) })),
    ...OCCASIONS.map((o) => ({ kind: 'Occasion', label: o.title, sub: o.note, image: o.images[0], run: () => { scrollToId('occasions'); window.dispatchEvent(new CustomEvent('ammies:occasion', { detail: o.id })) } })),
    ...[['collection', 'Shop the collection'], ['how', 'How it works'], ['about', 'About Ammie'], ['gallery', 'Photo gallery'], ['groups', 'Group orders'], ['faq', 'Questions and answers']].map(([id, label]) => ({ kind: 'Page', label, sub: 'Jump to section', run: () => scrollToId(id) })),
  ], [onOpenProduct, onQuote])
  const res = q.trim() ? all.filter((x) => (x.label + ' ' + x.sub + ' ' + x.kind).toLowerCase().includes(q.trim().toLowerCase())) : all.slice(0, 8)
  const pick = (x) => { onClose(); setTimeout(x.run, 380) }
  return (
    <Popup open={open} onClose={onClose} label="Search" className="pop--search">
      <div className="srch" onKeyDown={(e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(res.length - 1, a + 1)) }
        if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
        if (e.key === 'Enter' && res[active]) { e.preventDefault(); pick(res[active]) }
      }}>
        <label className="srch__bar">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          <span className="sr">Search</span>
          <input data-autofocus value={q} onChange={(e) => { setQ(e.target.value); setActive(0) }} placeholder="Search tumblers, jackets, memorial shirts…" role="combobox" aria-expanded="true" aria-controls="srch-list" aria-activedescendant={res[active] ? `sr-${active}` : undefined} />
          <kbd>Esc</kbd>
        </label>
        <ul className="srch__list" id="srch-list" role="listbox">
          {res.map((x, i) => (
            <li key={x.kind + x.label} id={`sr-${i}`} role="option" aria-selected={i === active}>
              <button className={i === active ? 'is-on' : ''} onMouseEnter={() => setActive(i)} onClick={() => pick(x)}>
                {x.image ? <img src={img(x.image, true)} alt="" /> : <span className="srch__ico" aria-hidden="true">↘</span>}
                <span className="srch__txt"><b>{x.label}</b><small>{x.sub}</small></span>
                <span className="srch__kind">{x.kind}</span>
              </button>
            </li>
          ))}
          {!res.length && <li className="srch__empty">Nothing matches “{q}”. Try “jacket”, “memorial” or “tumbler”, or <button className="link" onClick={() => pick({ run: () => onQuote('Something else') })}>ask Ammie for a quote</button>.</li>}
        </ul>
      </div>
    </Popup>
  )
}
