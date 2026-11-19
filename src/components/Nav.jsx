import { useEffect, useRef, useState } from 'react'
import { useCart, money } from '../lib/cart'
import { gsap, scrollToId, reducedMotion } from '../lib/motion'
import { PRODUCTS, QUOTES, img } from '../data/catalog'
import { START, TOTAL } from '../data/story'

const EXPLORE = [
  ['how', 'How it works', 'From your idea to your door in four steps'],
  ['occasions', 'Occasions', 'Game day, senior year, memorials and more'],
  ['about', 'About Ammie', 'The maker behind every piece'],
  ['gallery', 'Gallery', 'Real orders, straight from the studio'],
  ['groups', 'Group orders', 'Teams, families and crews'],
  ['faq', 'Questions', 'Photos, timing, shipping'],
]

/** Hides after a few idle seconds or when scrolling down; returns on scroll up or cursor near the top. */
function useAutoHide(hold) {
  const [hidden, setHidden] = useState(false)
  const holdRef = useRef(hold)
  holdRef.current = hold
  useEffect(() => {
    let timer, last = window.scrollY
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
    const arm = () => { clearTimeout(timer); timer = setTimeout(() => { if (!holdRef.current && window.scrollY > 120) setHidden(true) }, 2600) }
    const show = () => { setHidden(false); arm() }
    const onScroll = () => {
      const y = window.scrollY
      if (y < last - 4 || y < 120) show()
      else if (y > last + 6 && !holdRef.current) setHidden(true)
      last = y
    }
    const onMove = (e) => { if (fine && e.clientY < 90) show() }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    arm()
    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll); window.removeEventListener('pointermove', onMove) }
  }, [])
  useEffect(() => { if (hold) setHidden(false) }, [hold])
  return hidden
}

function Dropdown({ id, label, open, setOpen, children, wide }) {
  const panel = useRef(null)
  useEffect(() => {
    if (!open || !panel.current) return
    const rm = reducedMotion()
    gsap.fromTo(panel.current, { opacity: 0, y: -10, clipPath: 'inset(0 0 100% 0 round 24px)' }, { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0 round 24px)', duration: rm ? 0 : 0.55, ease: 'expo.out' })
    if (!rm) gsap.from(panel.current.querySelectorAll('.dd__i'), { y: 12, opacity: 0, stagger: 0.03, duration: 0.45, ease: 'expo.out', delay: 0.05 })
  }, [open])
  return (
    <div className={`dd ${open ? 'is-open' : ''}`} onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(id)} onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(null)}>
      <button className="nav__a dd__btn" aria-expanded={open} aria-controls={`dd-${id}`} onClick={() => setOpen(open ? null : id)}>
        {label}<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" /></svg>
      </button>
      {open && <div className={`dd__panel glass ${wide ? 'dd__panel--wide' : ''}`} id={`dd-${id}`} ref={panel}>{children}</div>}
    </div>
  )
}

export function Header({ onOpenProduct, onQuote, onSearch }) {
  const { items, count, subtotal, setOpen: setBag, pulse } = useCart()
  const [dd, setDd] = useState(null)
  const [menu, setMenu] = useState(false)
  const [hover, setHover] = useState(false)
  const [mini, setMini] = useState(false)
  const miniRef = useRef(null)
  const bagRef = useRef(null)
  const hidden = useAutoHide(!!dd || menu || hover || mini)

  useEffect(() => {
    if (!pulse) return
    setMini(true)
    if (bagRef.current) gsap.fromTo(bagRef.current, { scale: 1 }, { scale: 1.14, duration: 0.18, yoyo: true, repeat: 1 })
    const t = setTimeout(() => setMini(false), 4500)
    return () => clearTimeout(t)
  }, [pulse])
  useEffect(() => {
    if (mini && miniRef.current) gsap.fromTo(miniRef.current, { opacity: 0, y: -10, scale: 0.92, transformOrigin: '90% 0' }, { opacity: 1, y: 0, scale: 1, duration: reducedMotion() ? 0 : 0.55, ease: 'back.out(1.7)' })
  }, [mini])
  useEffect(() => {
    if (!dd) return
    const k = (e) => e.key === 'Escape' && setDd(null)
    const d = (e) => { if (!e.target.closest('.dd')) setDd(null) }
    window.addEventListener('keydown', k); document.addEventListener('pointerdown', d)
    return () => { window.removeEventListener('keydown', k); document.removeEventListener('pointerdown', d) }
  }, [dd])
  useEffect(() => {
    const onKey = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); onSearch() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onSearch])

  const go = (id) => { setDd(null); setMenu(false); scrollToId(id) }
  const last = items.at(-1)

  return (
    <header className={`nav glass ${hidden ? 'is-hidden' : ''} ${menu ? 'is-menu' : ''}`} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      <a className="nav__brand" href="#hero" onClick={(e) => { e.preventDefault(); go('hero') }} aria-label="Ammie's Creations, back to top">
        <img src={img('brand-ammie', true)} alt="" />
        <span>Ammie’s <i>Creations</i></span>
      </a>
      <nav className="nav__links" aria-label="Main">
        <Dropdown id="shop" label="Shop" open={dd === 'shop'} setOpen={setDd} wide>
          <div className="mega">
            <div className="mega__col">
              <p className="mega__h">Order online</p>
              <div className="mega__grid">
                {PRODUCTS.map((p) => (
                  <button key={p.id} className="dd__i mega__p" onClick={() => { setDd(null); setMenu(false); onOpenProduct(p.id) }}>
                    <img src={img(p.images[0], true)} alt="" />
                    <span><b>{p.name}</b><small>{money(p.price)} · {p.kind}</small></span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mega__col mega__col--side">
              <p className="mega__h">Made to order</p>
              <ul>
                {QUOTES.map((q) => <li key={q.id}><button className="dd__i mega__q" onClick={() => { setDd(null); setMenu(false); onQuote(q.name) }}>{q.name}</button></li>)}
              </ul>
              <button className="dd__i btn btn--ink btn--sm" onClick={() => go('collection')}>See the full collection</button>
            </div>
          </div>
        </Dropdown>
        <Dropdown id="explore" label="Explore" open={dd === 'explore'} setOpen={setDd}>
          <ul className="explore">
            {EXPLORE.map(([id, t, n]) => (
              <li key={id}><button className="dd__i" onClick={() => go(id)}><b>{t}</b><small>{n}</small></button></li>
            ))}
          </ul>
        </Dropdown>
        <button className="nav__a" onClick={() => go('gallery')}>Gallery</button>
        <button className="nav__a" onClick={() => go('about')}>About</button>
      </nav>
      <div className="nav__right">
        <button className="nav__icon" onClick={onSearch} aria-label="Search (Ctrl K)">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          <kbd>Ctrl K</kbd>
        </button>
        <button className="nav__quote" onClick={() => onQuote('')}>Get a quote</button>
        <button className="nav__bag" id="bag-button" ref={bagRef} onClick={() => { setMini(false); setBag(true) }} aria-label={`Open bag, ${count} items`}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
          <b className={count ? 'has' : ''}>{count}</b>
        </button>
        <button className="nav__burger" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label="Menu"><i /><i /></button>
        {mini && last && (
          <div className="mini glass" ref={miniRef} role="status">
            <p className="mini__t">Added to your bag</p>
            <div className="mini__row"><img src={img(last.product.images[0], true)} alt="" /><div><b>{last.product.name}</b><small>{Object.values(last.options).filter(Boolean).slice(0, 2).join(', ')}</small></div></div>
            <div className="mini__sub"><span>{count} {count === 1 ? 'item' : 'items'}</span><b>{money(subtotal)}</b></div>
            <button className="btn btn--accent btn--wide btn--sm" onClick={() => { setMini(false); setBag(true) }}>View bag and check out</button>
          </div>
        )}
      </div>
      {menu && (
        <div className="sheet glass" data-lenis-prevent>
          <p className="sheet__h">Shop</p>
          {PRODUCTS.map((p) => <button key={p.id} className="sheet__p" onClick={() => { setMenu(false); onOpenProduct(p.id) }}><img src={img(p.images[0], true)} alt="" /><span>{p.name}</span><b>{money(p.price)}</b></button>)}
          <p className="sheet__h">Explore</p>
          <div className="sheet__links">{EXPLORE.map(([id, t]) => <button key={id} onClick={() => go(id)}>{t}</button>)}</div>
          <button className="btn btn--accent btn--wide" onClick={() => { setMenu(false); onQuote('') }}>Get a quote</button>
        </div>
      )}
    </header>
  )
}

const RAIL = [['tumbler', 'Tumbler'], ['making', 'Making'], ['jacket', 'Jacket'], ['jersey', 'Jersey'], ['senior', 'Senior']]

/** Glass pill during the 3D story: where you are, jump between chapters, or skip to the shop. */
export function ChapterRail({ chapter }) {
  const [p, setP] = useState(0)
  useEffect(() => {
    const on = () => setP(Math.min(1, window.scrollY / ((TOTAL / 100) * innerHeight)))
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const visible = !['hero', 'intro', 'closing', 'store'].includes(chapter)
  const jump = (id) => window.scrollTo({ top: (START[id] / 100) * innerHeight + (id === 'making' ? 0 : innerHeight * 0.6), behavior: reducedMotion() ? 'auto' : 'smooth' })
  return (
    <div className={`rail glass ${visible ? 'is-on' : ''}`} aria-hidden={!visible}>
      <div className="rail__bar"><i style={{ transform: `scaleX(${p})` }} /></div>
      <ol>
        {RAIL.map(([id, label]) => (
          <li key={id}><button tabIndex={visible ? 0 : -1} className={chapter === id ? 'is-on' : ''} onClick={() => jump(id)}>{label}</button></li>
        ))}
      </ol>
      <button className="rail__skip" tabIndex={visible ? 0 : -1} onClick={() => scrollToId('collection')}>Skip to shop <span aria-hidden="true">↓</span></button>
    </div>
  )
}

/** Phone dock: the four things people reach for most. */
export function Dock({ onQuote, onSearch }) {
  const { count, setOpen } = useCart()
  return (
    <nav className="dock glass" aria-label="Quick actions">
      <button onClick={() => scrollToId('collection')}><svg viewBox="0 0 24 24"><path d="M4 7h16l-1.5 13h-13Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>Shop</button>
      <button onClick={onSearch}><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>Search</button>
      <button onClick={() => onQuote('')}><svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4Z" /></svg>Quote</button>
      <button onClick={() => setOpen(true)}><svg viewBox="0 0 24 24"><path d="M6 8h12l-1 12H7L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>Bag{count ? <b>{count}</b> : null}</button>
    </nav>
  )
}
