import { useCallback, useEffect, useRef, useState } from 'react'
import { startSmoothScroll, ScrollTrigger, gsap, reducedMotion } from './lib/motion'
import { createStage, createState } from './scene/Stage'
import { startChoreography } from './scene/choreography'
import { CHAPTERS } from './data/story'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import { BgWords, Bokeh, Hero, Intro, Chapter, Making, MakingWords, Closing } from './components/Sections'
import { Header, ChapterRail, Dock } from './components/Nav'
import { Collection, HowItWorks, Occasions, About, Gallery, GroupOrders, Faq, Footer } from './components/Store'
import ProductSheet from './components/ProductSheet'
import CartDrawer from './components/CartDrawer'
import Toast from './components/Toast'
import { QuotePopup, NewsletterPopup, SearchPopup } from './components/Popups'

export default function App() {
  const canvas = useRef(null)
  const stage = useRef(null)
  const state = useRef(createState())
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const [chapter, setChapter] = useState('hero')
  const [sheet, setSheet] = useState(null)
  const [quote, setQuote] = useState(null)
  const [search, setSearch] = useState(false)

  useEffect(() => {
    let texP = 0, fontP = 0
    const report = () => setProgress(texP * 0.75 + fontP * 0.25)
    try {
      stage.current = createStage(canvas.current, state.current, (p) => { texP = p; report() })
    } catch (e) {
      console.error(e); texP = 1; report()
    }
    document.fonts.ready.then(() => { fontP = 1; report() })
    startSmoothScroll()
    const stop = startChoreography(state.current, (ch) => setChapter(ch))
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => { stop(); stage.current?.dispose(); window.removeEventListener('load', onLoad) }
  }, [])

  const onLoaded = useCallback(() => {
    setReady(true)
    gsap.to(state.current, { intro: 1, duration: reducedMotion() ? 0 : 1.6, ease: 'expo.out' })
    ScrollTrigger.refresh()
  }, [])

  const openProduct = useCallback((id, preset = {}) => setSheet({ id, preset }), [])
  const openQuote = useCallback((item = '', extra = {}) => setQuote({ item, ...extra }), [])
  const openSearch = useCallback(() => setSearch(true), [])

  return (
    <>
      <Preloader progress={progress} onDone={onLoaded} />
      <Cursor />
      <BgWords />
      <canvas className="stage" ref={canvas} aria-hidden="true" />
      <Bokeh />
      <MakingWords />
      <Header onOpenProduct={openProduct} onQuote={openQuote} onSearch={openSearch} />
      <main>
        <div className="story">
          <Hero ready={ready} onQuote={openQuote} />
          <Intro />
          <Chapter ch={CHAPTERS[0]} onOpen={openProduct} onName={(n) => stage.current?.setName(n)} />
          <Making />
          {CHAPTERS.slice(1).map((c) => <Chapter key={c.id} ch={c} onOpen={openProduct} onName={() => {}} />)}
          <Closing onOpen={openProduct} onQuote={openQuote} />
        </div>
        <div className="store">
          <Collection onOpen={openProduct} onQuote={openQuote} />
          <HowItWorks onQuote={openQuote} />
          <Occasions onOpen={openProduct} onQuote={openQuote} />
          <About onQuote={openQuote} />
          <Gallery onQuote={openQuote} />
          <GroupOrders onQuote={openQuote} />
          <Faq onQuote={openQuote} />
        </div>
      </main>
      <Footer onOpen={openProduct} onQuote={openQuote} />
      <ChapterRail chapter={chapter} />
      <Dock onQuote={openQuote} onSearch={openSearch} />
      <ProductSheet sheet={sheet} onClose={() => setSheet(null)} />
      <CartDrawer />
      <QuotePopup open={quote !== null} preset={quote} onClose={() => setQuote(null)} />
      <SearchPopup open={search} onClose={() => setSearch(false)} onOpenProduct={openProduct} onQuote={openQuote} />
      <NewsletterPopup ready={ready} />
      <Toast />
    </>
  )
}
