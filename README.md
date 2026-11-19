# Ammie's Creations, v2: "Blank to Beautiful"

A second design for Ammie's Creations, modelled on the scroll-story layout and motion of
brocksbushes.moonshiners.co.uk ("Field to Still"). Where that site fills a gin bottle, this one
customizes Ammie's own pieces: a blank tumbler gets its glitter wrap, and pencil-sketch prints
turn into her real finished jackets and shirts.

The first design is still in `../website`; this folder is fully separate.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
```

## The scroll story

| Section | Length | What happens |
|---|---|---|
| Preloader | until assets load | a line-drawn tumbler fills with pink glitter, % counter |
| Hero | 1 screen | "Blank to Beautiful", white blank tumbler, giant TUMBLER word behind |
| Intro | 1.5 screens | statement darkens word by word; lid pops off, glitter pours in, the printed wrap rises up the blank |
| Name Tumbler | 2 screens | letters swing in, body text inks in, tags pop; type a name to see it on the 3D tumbler |
| What goes into it | 3 screens | tumbler spins centre stage while DTF Print, Sublimation, Rhinestones and Heat Press sweep across with flocks of ink dots, crystals and steam |
| Bling Jean Jacket | 2 screens | print drops in as a pencil sketch, the real photo fills it from the bottom; crystals rain, lilac background |
| Team Jersey | 2 screens | same, with lime stars and a green background |
| Senior Mom Shirt | 2 screens | same, with gold confetti and a warm background |
| Closing | 1 screen | all four pieces line up behind "One studio. Your story." with shop links |

Reference features carried over: fixed WebGL stage under scrolling HTML, Lenis smooth scroll,
DM Serif Display + Inter, giant faded word behind the product, falling 3D objects tied to scroll speed,
blurred foreground bokeh, rotating letter headings, word-by-word text ink, tag pills, orange cursor
dot with ring, background color shift per chapter, and the closing line-up.

## After the story: the store

| Section | What's there |
|---|---|
| Collection | filter chips (apparel, drinkware, made to order), glass sort dropdown, cards that flick through photos on hover, quick view, made-to-order quote cards, trust strip |
| How it works | sticky photo frame that changes as you scroll through 4 steps, progress line |
| Occasions | 6 tabs (arrow keys work), fanned photos, suggested pieces and quote links |
| About Ammie | her brand art, bio quote, how she works, spinning sticker |
| Gallery | 35 real orders, 6 filters, masonry grid, lightbox with captions, arrows, swipe, thumbnails and "Order something like this" |
| Group orders | planner: piece, quantity slider, date and a live estimate at regular prices, then straight into the quote form |
| FAQ | 6 answers, smooth accordion |
| Footer | call to action, newsletter, shop / explore / help links, filling wordmark, back to top |

## Navigation and pop-ups

- Glass header that hides while you scroll down and returns on scroll up or when the cursor nears the top. Shop mega menu, Explore dropdown, search, quote and bag buttons.
- Search with Ctrl+K (Cmd+K on Mac): pieces, made-to-order items, occasions and sections, keyboard navigable.
- Story rail during the 3D story: shows the chapter, jumps between chapters, and "Skip to shop".
- Phone dock: Shop, Search, Quote, Bag.
- Pop-ups: quick view / personalizer, bag drawer, mini-bag after adding, quote request (copies a ready message and opens Messenger), lightbox, search, and a "Join the glitter list" newsletter (once per visitor, when the cursor heads for the tab bar or after a minute).

## How the scroll story stays in sync

`src/scene/choreography.js` computes every 3D value, flying word, background word and colour directly from the current
scroll position on each frame (no stacked tweens), so scrolling back up always restores exactly the right state.

## Files

| File | Purpose |
|---|---|
| `src/data/story.js` | section lengths, chapter copy, colors and giant words |
| `src/scene/choreography.js` | the master GSAP timeline (one unit = 1% of screen height scrolled) |
| `src/scene/Stage.js` | three.js scene, phone layout, render loop |
| `src/scene/tumbler.js` | 3D tumbler with the rising wrap shader, lid and glitter pour |
| `src/scene/photoCard.js` | print card: sketch-to-photo fill shader |
| `src/scene/particles.js` | hearts, pearls, crystals, stars, confetti, word flocks |
| `src/components/` | preloader, cursor, page sections, product sheet, bag, quote pop-up |
| `public/img/*-sketch.jpg` | pencil versions generated from Ammie's photos |

## Checkout

Same as v1: personalization goes into the Shopify order note through a cart permalink on
ammiescreations.com (`/cart/VARIANT:QTY?note=...&ref=ammies-new-site`). Variant IDs live in
`src/data/catalog.js`.

## Swapping a chapter photo

1. Put a portrait photo (3:4) in `public/img/`.
2. Make a pencil version with the same name plus `-sketch.jpg` and the photo as `-color.jpg`
   (768×1024). Any "photo to sketch" filter works; the ones here were made with an OpenCV colour-dodge.
3. Set `image` on the chapter in `src/data/story.js`.
