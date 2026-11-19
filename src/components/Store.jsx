import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reducedMotion, scrollToId } from '../lib/motion'
import { PRODUCTS, QUOTES, OCCASIONS, GALLERY_ITEMS, GALLERY_CATS, STEPS, CATEGORIES, STORE, img } from '../data/catalog'
import { money } from '../lib/cart'
import { SwingTitle } from './TextFx'
import { Lightbox, NewsletterForm } from './Popups'
import Select from './Select'

/** Fade-and-rise for a group of children the first time they come into view. */
function useReveal(selector, deps = []) {
  const root = useRef(null)
  useLayoutEffect(() => {
    if (reducedMotion() || !root.current) return
    const ctx = gsap.context(() => {
      ScrollTrigger.batch(root.current.querySelectorAll(selector), {
        start: 'top 88%', once: true,
        onEnter: (els) => gsap.fromTo(els, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.07, overwrite: true }),
      })
    }, root)
    return () => ctx.revert()
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
  return root
}

function SectionHead({ eyebrow, title, children, trigger, align }) {
  return (
    <div className={`shead ${align === 'center' ? 'shead--c' : ''}`}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <SwingTitle lines={[title]} trigger={trigger} start="top 85%" end="top 45%" className="shead__h" />
      </div>
      {children && <p className="shead__p">{children}</p>}
    </div>
  )
}

/* ---------------- collection ---------------- */
function ProductCard({ p, onOpen }) {
  const [i, setI] = useState(0)
  const timer = useRef(0)
  const start = () => { clearInterval(timer.current); timer.current = setInterval(() => setI((x) => (x + 1) % p.images.length), 900) }
  const stop = () => { clearInterval(timer.current); setI(0) }
  useEffect(() => () => clearInterval(timer.current), [])
  return (
    <article className="pcard rv" onPointerEnter={(e) => e.pointerType === 'mouse' && start()} onPointerLeave={stop}>
      <button className="pcard__media" onClick={() => onOpen(p.id)} aria-label={`Quick view ${p.name}`}>
        {p.images.map((im, k) => <img key={im} className={k === i ? 'is-on' : ''} src={img(im, true)} alt="" loading="lazy" />)}
        <span className="pcard__dots" aria-hidden="true">{p.images.map((im, k) => <i key={im} className={k === i ? 'is-on' : ''} />)}</span>
        <span className="pcard__badge glass">Ships across the USA</span>
        <span className="pcard__qv glass">Quick view</span>
      </button>
      <div className="pcard__info">
        <p className="pcard__kind">{p.kind} · {p.method}</p>
        <h3>{p.name}</h3>
        <p className="pcard__short">{p.short}</p>
        <div className="pcard__row">
          <b>{money(p.price)}</b>
          <button className="btn btn--ink btn--sm" onClick={() => onOpen(p.id)}>Personalize</button>
        </div>
      </div>
    </article>
  )
}

function QuoteCard({ q, onQuote }) {
  return (
    <article className="qcard rv">
      <button onClick={() => onQuote(q.name)}>
        <span className="qcard__media">
          {q.image ? <img src={img(q.image, true)} alt="" loading="lazy" /> : <span className="qcard__decal" aria-hidden="true">Your name here</span>}
          <span className="pcard__badge glass">Made to order</span>
        </span>
        <span className="qcard__name">{q.name}</span>
        <span className="qcard__from">{q.from}</span>
        <span className="qcard__ask">Request a quote <span aria-hidden="true">→</span></span>
      </button>
    </article>
  )
}

const FILTERS = [['all', 'Everything'], ['apparel', 'Apparel'], ['drinkware', 'Drinkware'], ['quote', 'Made to order']]
const SORTS = ['Featured', 'Price: low to high', 'Price: high to low']

export function Collection({ onOpen, onQuote }) {
  const [f, setF] = useState('all')
  const [sort, setSort] = useState(SORTS[0])
  const root = useReveal('.rv', [f, sort])
  const prods = useMemo(() => {
    let list = PRODUCTS.filter((p) => f === 'all' || CATEGORIES[p.id] === f)
    if (sort === SORTS[1]) list = [...list].sort((a, b) => a.price - b.price)
    if (sort === SORTS[2]) list = [...list].sort((a, b) => b.price - a.price)
    return f === 'quote' ? [] : list
  }, [f, sort])
  const quotes = f === 'all' || f === 'quote' ? QUOTES : []
  return (
    <section className="block coll" id="collection" ref={root}>
      <SectionHead eyebrow="The collection" title="Pick a piece, make it yours" trigger={root}>
        Order these online with your names and colors, or ask Ammie to quote anything else she makes.
      </SectionHead>
      <div className="coll__bar">
        <div className="chips" role="tablist" aria-label="Filter the collection">
          {FILTERS.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={f === id} className={`chip ${f === id ? 'is-on' : ''}`} onClick={() => setF(id)}>{label}</button>
          ))}
        </div>
        <div className="coll__sort"><span id="sort-l">Sort</span><Select labelledBy="sort-l" value={sort} onChange={setSort} options={SORTS} /></div>
      </div>
      {prods.length > 0 && <div className="coll__grid">{prods.map((p) => <ProductCard key={p.id} p={p} onOpen={onOpen} />)}</div>}
      {quotes.length > 0 && (
        <>
          <div className="coll__sub"><h3>Made to order on request</h3><p>No fixed price yet, so Ammie quotes each one. Usually same day.</p></div>
          <div className="coll__qgrid">{quotes.map((q) => <QuoteCard key={q.id} q={q} onQuote={onQuote} />)}</div>
        </>
      )}
      <div className="coll__trust">
        <span><b>Secure checkout</b> through Shopify</span>
        <span><b>Made to order</b> for every customer</span>
        <span><b>Photos welcome</b> after you order</span>
        <span><b>Group orders</b> for teams and families</span>
      </div>
    </section>
  )
}

/* ---------------- how it works ---------------- */
export function HowItWorks({ onQuote }) {
  const root = useRef(null)
  const [active, setActive] = useState(0)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.how2__step').forEach((el, i) => {
        ScrollTrigger.create({ trigger: el, start: 'top 60%', end: 'bottom 60%', onToggle: (s) => s.isActive && setActive(i) })
      })
      if (!reducedMotion()) gsap.fromTo('.how2__line i', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.how2__steps', start: 'top 60%', end: 'bottom 60%', scrub: true } })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section className="block how2" id="how" ref={root}>
      <div className="how2__grid">
        <div className="how2__sticky">
          <p className="eyebrow">How it works</p>
          <SwingTitle lines={['From your idea', 'to your door']} trigger={root} start="top 80%" end="top 40%" className="shead__h" />
          <div className="how2__frame glass">
            {STEPS.map((s, i) => <img key={s.im} className={i === active ? 'is-on' : ''} src={img(s.im)} alt="" loading="lazy" />)}
            <span className="how2__n">{active + 1}<small>/4</small></span>
          </div>
        </div>
        <ol className="how2__steps">
          <div className="how2__line" aria-hidden="true"><i /></div>
          {STEPS.map((s, i) => (
            <li key={s.t} className={`how2__step ${i === active ? 'is-on' : ''}`}>
              <span className="how2__dot" aria-hidden="true">{i + 1}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
              <img className="how2__mob" src={img(s.im, true)} alt="" loading="lazy" />
            </li>
          ))}
          <li className="how2__end">
            <p>Not sure where to start?</p>
            <button className="btn btn--accent" onClick={() => onQuote('Something else')}>Tell Ammie your idea</button>
          </li>
        </ol>
      </div>
    </section>
  )
}

/* ---------------- occasions ---------------- */
export function Occasions({ onOpen, onQuote }) {
  const root = useRef(null)
  const stage = useRef(null)
  const [cur, setCur] = useState(OCCASIONS[0].id)
  const o = OCCASIONS.find((x) => x.id === cur)
  useEffect(() => {
    const on = (e) => setCur(e.detail)
    window.addEventListener('ammies:occasion', on)
    return () => window.removeEventListener('ammies:occasion', on)
  }, [])
  useLayoutEffect(() => {
    if (!stage.current || reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.occ2__fan img', { y: 80, rotate: 0, opacity: 0 }, { y: 0, rotate: (i) => [-8, 2, 10][i], opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.07 })
      gsap.fromTo('.occ2__copy > *', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.05 })
    }, stage)
    return () => ctx.revert()
  }, [cur])
  const tabKey = (e) => {
    const i = OCCASIONS.findIndex((x) => x.id === cur)
    if (e.key === 'ArrowRight') setCur(OCCASIONS[(i + 1) % OCCASIONS.length].id)
    if (e.key === 'ArrowLeft') setCur(OCCASIONS[(i - 1 + OCCASIONS.length) % OCCASIONS.length].id)
  }
  return (
    <section className="block occ2" id="occasions" ref={root}>
      <SectionHead eyebrow="Occasions" title="Made for the moments that matter" trigger={root} align="center" />
      <div className="occ2__tabs" role="tablist" aria-label="Occasions" onKeyDown={tabKey}>
        {OCCASIONS.map((x) => (
          <button key={x.id} role="tab" aria-selected={x.id === cur} tabIndex={x.id === cur ? 0 : -1} className={`chip ${x.id === cur ? 'is-on' : ''}`} onClick={() => setCur(x.id)}>{x.title}</button>
        ))}
      </div>
      <div className="occ2__stage glass" ref={stage} role="tabpanel" aria-label={o.title}>
        <div className="occ2__fan">{o.images.map((im) => <img key={im} src={img(im, true)} alt="" />)}</div>
        <div className="occ2__copy">
          <h3>{o.title}</h3>
          <p>{o.body}</p>
          <div className="occ2__picks">
            {o.products.map((id) => { const p = PRODUCTS.find((x) => x.id === id); return (
              <button key={id} className="occ2__pick" onClick={() => onOpen(id)}><img src={img(p.images[0], true)} alt="" /><span><b>{p.name}</b><small>{money(p.price)}</small></span></button>
            ) })}
            {o.quotes.map((id) => { const q = QUOTES.find((x) => x.id === id); return (
              <button key={id} className="occ2__pick" onClick={() => onQuote(q.name)}>{q.image && <img src={img(q.image, true)} alt="" />}<span><b>{q.name}</b><small>Request a quote</small></span></button>
            ) })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- about ---------------- */
export function About({ onQuote }) {
  const root = useReveal('.rv')
  useLayoutEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.about__art', { clipPath: 'inset(12% 12% 12% 12% round 40px)', scale: 1.08 }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', scale: 1, ease: 'none', scrollTrigger: { trigger: '.about__art', start: 'top 90%', end: 'top 35%', scrub: true } })
      gsap.to('.about__sticker', { rotate: 360, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
    }, root)
    return () => ctx.revert()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section className="block about" id="about" ref={root}>
      <div className="about__visual">
        <img className="about__art" src={img('brand-ammie')} alt="Illustration of Ammie with a pink tumbler, surrounded by her custom shirts, mugs, totes and keychains" />
        <svg className="about__sticker" viewBox="0 0 120 120" aria-hidden="true">
          <defs><path id="ab-c" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0" /></defs>
          <circle cx="60" cy="60" r="58" />
          <text><textPath href="#ab-c">made to order ✦ pressed by hand ✦ made to order ✦ </textPath></text>
        </svg>
        <span className="about__chip glass rv">One maker, every order</span>
      </div>
      <div className="about__text">
        <p className="eyebrow">About Ammie</p>
        <SwingTitle lines={['Hi, I’m Ammie.']} trigger={root} start="top 80%" end="top 40%" className="shead__h about__h" />
        <blockquote className="about__q rv">“If you can imagine it, I can make it come to life for you.”</blockquote>
        <p className="rv">Every piece here starts as somebody’s idea: a kid’s jersey number, a grandma’s photo, a class year, a little extra sparkle for a night out.</p>
        <p className="rv">I design each one for your order, press it with DTF or sublimation, and set the rhinestones by hand. Nothing is mass-produced, so if you want it a little different, just tell me.</p>
        <ul className="about__facts rv">
          <li><b>DTF printing</b><span>bold prints on cotton, denim and dark fabrics</span></li>
          <li><b>Sublimation</b><span>designs bonded into tumblers and coasters, so they never peel</span></li>
          <li><b>Hand-set bling</b><span>rhinestones placed one sparkle at a time</span></li>
        </ul>
        <div className="about__ctas rv">
          <button className="btn btn--accent" onClick={() => onQuote('Something else')}>Tell me your idea</button>
          <a className="link" href={STORE.facebook} target="_blank" rel="noreferrer">Follow along on Facebook</a>
        </div>
        <p className="about__sig rv">— Ammie</p>
      </div>
    </section>
  )
}

/* ---------------- gallery ---------------- */
export function Gallery({ onQuote }) {
  const [cat, setCat] = useState('all')
  const [lb, setLb] = useState(null)
  const [more, setMore] = useState(false)
  const items = useMemo(() => GALLERY_ITEMS.filter((x) => cat === 'all' || x.cat === cat), [cat])
  const shown = more || cat !== 'all' ? items : items.slice(0, 16)
  const root = useReveal('.gitem', [cat, more])
  return (
    <section className="block gal2" id="gallery" ref={root}>
      <SectionHead eyebrow="The gallery" title="Fresh off the press" trigger={root}>
        Every photo is a real order Ammie made for a customer. Tap one to see it bigger, then order something like it.
      </SectionHead>
      <div className="chips gal2__tabs" role="tablist" aria-label="Filter photos">
        {GALLERY_CATS.map(([id, label]) => {
          const n = id === 'all' ? GALLERY_ITEMS.length : GALLERY_ITEMS.filter((x) => x.cat === id).length
          return <button key={id} role="tab" aria-selected={cat === id} className={`chip ${cat === id ? 'is-on' : ''}`} onClick={() => { setCat(id); setMore(false) }}>{label} <small>{n}</small></button>
        })}
      </div>
      <div className="gal2__grid">
        {shown.map((it, i) => (
          <figure key={it.image} className="gitem">
            <button onClick={() => setLb(i)} aria-label={`Open photo: ${it.caption}`}>
              <img src={img(it.image, true)} alt={it.caption} loading="lazy" />
              <figcaption className="glass">{it.caption}</figcaption>
            </button>
          </figure>
        ))}
      </div>
      {!more && cat === 'all' && items.length > 16 && (
        <div className="gal2__more"><button className="btn btn--ink" onClick={() => setMore(true)}>Show all {items.length} photos</button></div>
      )}
      <Lightbox items={shown} index={lb} onIndex={setLb} onClose={() => setLb(null)} onQuote={onQuote} />
    </section>
  )
}

/* ---------------- group orders ---------------- */
const GROUP_ITEMS = [...PRODUCTS.map((p) => p.name), ...QUOTES.map((q) => q.name)]
export function GroupOrders({ onQuote }) {
  const root = useReveal('.rv')
  const [item, setItem] = useState(PRODUCTS[1].name)
  const [qty, setQty] = useState(12)
  const [when, setWhen] = useState('')
  const p = PRODUCTS.find((x) => x.name === item)
  const total = p ? p.price * qty : null
  const send = () => onQuote(item, { qty, when })
  return (
    <section className="block grp2" id="groups" ref={root}>
      <div className="grp2__copy">
        <p className="eyebrow">Group orders</p>
        <SwingTitle lines={['Outfitting a team,', 'class or family?']} trigger={root} start="top 80%" end="top 40%" className="shead__h" />
        <p className="rv">Send the roster, colors and logo. Ammie will quote the whole order and match every piece, from the coach’s shirt to grandma’s tumbler.</p>
        <ul className="grp2__list rv">
          <li>Team jerseys and name-down-the-back tees</li>
          <li>Matching memorial shirts for the whole family</li>
          <li>Senior night sets for parents and siblings</li>
          <li>Bridal party and birthday crew jackets</li>
        </ul>
        <div className="grp2__fan rv" aria-hidden="true">{['team-names', 'dance-shirt', 'memorial-purple-2'].map((im) => <img key={im} src={img(im, true)} alt="" />)}</div>
      </div>
      <div className="planner glass rv">
        <h3>Plan your group order</h3>
        <div className="planner__f"><span id="pl-item">Piece</span><Select labelledBy="pl-item" value={item} onChange={setItem} options={GROUP_ITEMS} /></div>
        <div className="planner__f">
          <label htmlFor="pl-qty">How many? <b>{qty}</b></label>
          <input id="pl-qty" type="range" min="2" max="100" value={qty} onChange={(e) => setQty(+e.target.value)} style={{ '--p': `${((qty - 2) / 98) * 100}%` }} />
          <div className="planner__ticks" aria-hidden="true"><span>2</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
        </div>
        <label className="planner__f">Needed by<input type="date" value={when} onChange={(e) => setWhen(e.target.value)} /></label>
        <div className="planner__est" aria-live="polite">
          {total !== null
            ? <><span>At the regular price</span><b>{money(total)}</b><small>{qty} × {money(p.price)}. Ammie will confirm group pricing in your quote.</small></>
            : <><span>Custom piece</span><b>Quoted by Ammie</b><small>Made-to-order items are priced for your exact order.</small></>}
        </div>
        <button className="btn btn--accent btn--wide" onClick={send}>Send to Ammie for a quote</button>
      </div>
    </section>
  )
}

/* ---------------- faq ---------------- */
const QA = [
  ['How do I send my photos?', 'Place your order first, then reply to your order confirmation email or message Ammie on Facebook with the photos. Your order number links everything together.'],
  ['How long does a custom order take?', 'Every piece is made to order, so timing depends on the design and the season. If you need it by a date, put it in the notes and Ammie will confirm before she starts.'],
  ['What’s the difference between DTF and sublimation?', 'DTF (direct to film) prints your design onto a film that’s heat pressed onto fabric, so it works on cotton, denim and dark colors. Sublimation turns ink into gas that bonds into coated surfaces like tumblers and coasters, so the design becomes part of the finish and won’t peel.'],
  ['Where do you ship, and what does it cost?', 'Orders ship within the USA. Shipping and any tax are calculated at Shopify checkout before you pay.'],
  ['Can I order something that isn’t listed?', 'Yes. Most of what Ammie makes is custom. Use “Get a quote” and describe what you have in mind.'],
  ['Is checkout secure?', 'Yes. Payment happens on Ammie’s Shopify checkout at ammiescreations.com, with cards, Shop Pay, PayPal and Google Pay.'],
]
export function Faq({ onQuote }) {
  const root = useRef(null)
  const [open, setOpen] = useState(0)
  return (
    <section className="block faq2" id="faq" ref={root}>
      <div className="faq2__side">
        <p className="eyebrow">Good to know</p>
        <SwingTitle lines={['Questions,', 'answered']} trigger={root} start="top 80%" end="top 40%" className="shead__h" />
        <p>Something else on your mind?</p>
        <button className="btn btn--ink" onClick={() => onQuote('Something else')}>Ask Ammie</button>
      </div>
      <ul className="faq2__list glass">
        {QA.map(([q, a], i) => (
          <li key={q} className={`fq ${open === i ? 'is-open' : ''}`}>
            <button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}><span>{q}</span><i aria-hidden="true" /></button>
            <div className="fq__a" style={{ gridTemplateRows: open === i ? '1fr' : '0fr' }}><div><p>{a}</p></div></div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------------- footer ---------------- */
export function Footer({ onOpen, onQuote }) {
  const root = useRef(null)
  useLayoutEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.ft__fill', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', ease: 'none', scrollTrigger: { trigger: '.ft__word', start: 'top bottom', end: 'bottom bottom', scrub: true } })
    }, root)
    return () => ctx.revert()
  }, [])
  const go = (id) => scrollToId(id)
  return (
    <footer className="ft" ref={root}>
      <div className="ft__cta">
        <h2>Tell me your idea and I’ll bring it to life.</h2>
        <div className="ft__ctas">
          <button className="btn btn--accent" onClick={() => onQuote('Something else')}>Start a custom order</button>
          <button className="btn btn--glass" onClick={() => go('collection')}>Shop the collection</button>
        </div>
      </div>
      <div className="ft__grid">
        <div className="ft__brand">
          <img src={img('brand-ammie', true)} alt="Ammie's Creations" />
          <p>Custom tumblers, DTF apparel, bling jackets and keepsakes, made to order and shipped across the USA.</p>
          <p className="ft__nl">Join the glitter list</p>
          <NewsletterForm compact />
        </div>
        <nav aria-label="Shop">
          <p>Shop</p>
          {PRODUCTS.map((p) => <button key={p.id} onClick={() => onOpen(p.id)}>{p.name}</button>)}
          <button onClick={() => go('collection')}>Made to order</button>
        </nav>
        <nav aria-label="Explore">
          <p>Explore</p>
          {[['how', 'How it works'], ['occasions', 'Occasions'], ['about', 'About Ammie'], ['gallery', 'Gallery'], ['groups', 'Group orders']].map(([id, t]) => <button key={id} onClick={() => go(id)}>{t}</button>)}
        </nav>
        <nav aria-label="Help">
          <p>Help</p>
          <button onClick={() => go('faq')}>Questions</button>
          <a href={STORE.contact} target="_blank" rel="noreferrer">Contact form</a>
          <a href={STORE.messenger} target="_blank" rel="noreferrer">Message on Facebook</a>
          <a href={STORE.account} target="_blank" rel="noreferrer">My orders</a>
          <a href={STORE.privacy} target="_blank" rel="noreferrer">Privacy policy</a>
        </nav>
      </div>
      <div className="ft__word" aria-hidden="true"><span className="ft__outline">Ammie’s</span><span className="ft__fill">Ammie’s</span></div>
      <div className="ft__legal">
        <span>© {new Date().getFullYear()} Ammie’s Creations. Secure checkout by Shopify.</span>
        <a href={STORE.facebook} target="_blank" rel="noreferrer" className="ft__fb" aria-label="Facebook">
          <svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3c-2.8 0-4 1.8-4 4.3V10H7v4h3v7h4v-7h3l1-4h-4V8.6c0-.4.3-.6.6-.6Z" /></svg>Facebook
        </a>
        <button className="ft__top" onClick={() => go('hero')}>Back to top <span aria-hidden="true">↑</span></button>
      </div>
    </footer>
  )
}
