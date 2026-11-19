import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, reducedMotion, scrollToId } from '../lib/motion'
import { SwingTitle, InkText, Tags } from './TextFx'
import { CHAPTERS, MAKING, SECTIONS } from '../data/story'
import { PRODUCTS, STORE, img } from '../data/catalog'
import { money } from '../lib/cart'

const vh = (id) => ({ height: `${SECTIONS.find((s) => s.id === id).vh}svh` })

/** Giant faded words that sit behind the 3D object, one per chapter. */
export function BgWords() {
  return (
    <div className="bgw" aria-hidden="true">
      {CHAPTERS.map((c, i) => (
        <span key={c.id} data-id={c.id} className={`bgw__w bgw--${c.id}`} style={{ opacity: i === 0 ? 1 : 0 }}>{c.word}</span>
      ))}
    </div>
  )
}

/** Big blurred out-of-focus shapes drifting close to the "camera". */
export function Bokeh() {
  const root = useRef(null)
  useLayoutEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.bokeh i').forEach((b, i) => {
        gsap.to(b, { yPercent: [-260, -420, -180, -340][i], ease: 'none', scrollTrigger: { trigger: document.body, start: 0, end: 'max', scrub: 1.2 } })
      })
    }, root)
    return () => ctx.revert()
  }, [])
  return <div className="bokeh" ref={root} aria-hidden="true"><i /><i /><i /><i /></div>
}

export function Hero({ ready, onQuote }) {
  const root = useRef(null)
  useLayoutEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      if (reducedMotion()) return
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from('.hero__h1 .hl > span', { yPercent: 110, duration: 1.3, stagger: 0.1 })
        .from('.hero__sub, .hero__ctas, .hero__by', { y: 26, opacity: 0, duration: 1, stagger: 0.08 }, '-=0.9')
        .from('.scrollcue', { opacity: 0, duration: 1 }, '-=0.6')
    }, root)
    return () => ctx.revert()
  }, [ready])
  return (
    <section className="sec hero" id="hero" ref={root} style={vh('hero')}>
      <div className="hero__copy">
        <h1 className="hero__h1"><span className="hl"><span>Blank to</span></span><span className="hl"><span>Beautiful</span></span></h1>
        <p className="hero__sub">Custom tumblers, jackets and shirts, designed and pressed by hand for families across the USA.</p>
        <div className="hero__ctas">
          <button className="btn btn--ink" onClick={() => scrollToId('collection')}>Shop the collection <span aria-hidden="true">↓</span></button>
          <button className="link" onClick={() => scrollToId('intro')}>Watch it get made</button>
        </div>
        <div className="hero__by"><small>Pressed by</small><img src={img('brand-ammie', true)} alt="" /><span>Ammie’s Creations</span></div>
      </div>
      <div className="scrollcue" aria-hidden="true"><span>Scroll</span><i /></div>
    </section>
  )
}

export function Intro() {
  const root = useRef(null)
  return (
    <section className="sec intro" id="intro" ref={root} style={vh('intro')}>
      <div className="sticky">
        <InkText className="intro__p" trigger={root} start="top 70%" end="60% 60%"
          text="Every piece starts as a blank in Ammie’s studio. It leaves with somebody’s name, number or story pressed into it for good." />
      </div>
    </section>
  )
}

export function Chapter({ ch, onOpen, onName }) {
  const root = useRef(null)
  const p = PRODUCTS.find((x) => x.id === ch.productId)
  const [name, setName] = useState('Ammie')
  return (
    <section className={`sec chap chap--${ch.id}`} id={ch.id} ref={root} style={{ ...vh(ch.id), '--c': ch.accent }}>
      <div className="sticky">
        <div className="chap__copy">
          <span className="chap__pill">{ch.pill}</span>
          <p className="chap__kicker">{ch.kicker}</p>
          <SwingTitle lines={ch.title} trigger={root} start="top 70%" end="top 10%" className="chap__title" />
          <p className="chap__meta">{ch.meta}</p>
          <InkText text={ch.body} trigger={root} start="top 40%" end="top -20%" className="chap__body" />
          <Tags tags={ch.tags} trigger={root} />
          <div className="chap__buy">
            {ch.tryName && (
              <label className="chap__try">
                <span className="sr">Name to preview on the tumbler</span>
                <input value={name} maxLength={16} onChange={(e) => { setName(e.target.value); onName(e.target.value || 'Your name') }} placeholder="Try a name" />
              </label>
            )}
            <button className="btn btn--accent" onClick={() => onOpen(p.id, ch.tryName ? { 'Name on tumbler': name } : {})}>
              Personalize, {money(p.price)}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Making() {
  const root = useRef(null)
  return (
    <section className="sec making" id="making" ref={root} style={vh('making')}>
      <div className="sticky">
        <div className="making__cap">
          <p className="making__k">What goes into it</p>
          <p>Alongside every blank: film, ink, hand-set crystals and a whole lot of heat.</p>
        </div>
      </div>
    </section>
  )
}

/** The flying words live in a fixed layer so they can cross the whole screen. */
export function MakingWords() {
  return (
    <div className="mwords" aria-hidden="true">
      {MAKING.map((m, i) => (
        <div className={`mw mw--${i}`} key={m.word}>
          <span className="mw__w">{m.word}</span>
          <span className="mw__n">{m.note}</span>
        </div>
      ))}
    </div>
  )
}

export function Closing({ onOpen, onQuote }) {
  const root = useRef(null)
  return (
    <section className="sec closing" id="closing" ref={root} style={vh('closing')}>
      <div className="closing__blur" aria-hidden="true" />
      <div className="closing__copy">
        <SwingTitle as="h2" lines={['One studio. Your story.']} trigger={root} start="top 95%" end="top 55%" className="closing__h" />
        <p className="closing__sub">Tumblers, jackets, jerseys and photo shirts, made to order and paid for securely through Ammie’s Shopify checkout.</p>
        <div className="closing__ctas">
          <button className="btn btn--ink" onClick={() => scrollToId('collection')}>Shop the collection <span aria-hidden="true">↓</span></button>
          <button className="link" onClick={() => onQuote('')}>Request a quote</button>
        </div>
        <p className="closing__credit">Every photo on this page is a real order from Ammie’s Creations.</p>
      </div>
      <button className="closing__down" onClick={() => scrollToId('collection')} aria-label="Scroll to the collection"><span>The collection</span><i /></button>
    </section>
  )
}
