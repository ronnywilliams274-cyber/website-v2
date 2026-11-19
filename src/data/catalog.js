// Store config. Checkout runs on Ammie's existing Shopify store via cart permalinks:
// https://shopify.dev/docs/apps/build/checkout/create-cart-permalinks
export const STORE = {
  shopifyDomain: 'https://ammiescreations.com',
  facebook: 'https://www.facebook.com/profile.php?id=61594846034241',
  messenger: 'https://m.me/61594846034241',
  contact: 'https://ammiescreations.com/pages/contact',
  privacy: 'https://ammiescreations.com/policies/privacy-policy',
  account: 'https://ammiescreations.com/account',
}

const SIZES_ADULT = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
const SIZES_ALL = ['Youth S', 'Youth M', 'Youth L', ...SIZES_ADULT]

// Products that are live on Shopify. variantId comes from ammiescreations.com/products.json
export const PRODUCTS = [
  {
    id: 'bling-jacket',
    variantId: '44325986566203',
    handle: 'custom-bling-jean-jacket',
    name: 'Custom Bling Jean Jacket',
    short: 'Your name, photo or quote across the back, finished with as much sparkle as you want.',
    price: 75,
    kind: 'Jacket',
    method: 'DTF print and rhinestones',
    images: ['jacket-1', 'jacket-2', 'jacket-3', 'jacket-4'],
    tint: '#1b0e15',
    details: [
      'Fully custom back design: names, photos, logos or artwork',
      'Optional rhinestone bling for extra shine',
      'Vibrant DTF print that holds up wear after wear',
      'Made for birthdays, bridal parties, concerts and big nights',
      'Group and matching orders welcome',
    ],
    fields: [
      { key: 'Size', type: 'chips', options: SIZES_ADULT, required: true },
      { key: 'Back text', type: 'text', placeholder: 'Name, quote or team', max: 40, required: true },
      { key: 'Bling', type: 'chips', options: ['Light sparkle', 'Full bling', 'No bling'] },
      { key: 'Colors', type: 'text', placeholder: 'Pink and silver, team colors…', max: 40 },
      { key: 'Notes', type: 'area', placeholder: 'Tell me the idea. You can send photos after checkout.', max: 240 },
    ],
  },
  {
    id: 'team-jersey',
    variantId: '44325981159483',
    handle: 'custom-team-jersey-with-name-sleeve',
    name: 'Custom Team Jersey with Name Sleeve',
    short: 'Team, logo or artist on the front and a player or family name down the sleeve.',
    price: 60,
    kind: 'Jersey and hoodie',
    method: 'DTF print',
    images: ['jersey-1', 'jersey-2', 'team-names', 'name-shirt'],
    tint: '#b9f04a',
    details: [
      'Team name, logo or artist on the front in your colors',
      'Personalized name or number down the sleeve',
      'Bold DTF print that stays soft and flexible',
      'Add a matching tumbler to complete the set',
      'Team and group orders welcome',
    ],
    fields: [
      { key: 'Size', type: 'chips', options: SIZES_ALL, required: true },
      { key: 'Team or artist', type: 'text', placeholder: 'Palo Verde Bees', max: 40, required: true },
      { key: 'Sleeve name', type: 'text', placeholder: 'SALAZAR', max: 20 },
      { key: 'Number', type: 'text', placeholder: '51', max: 3 },
      { key: 'Colors', type: 'text', placeholder: 'Green and gold', max: 40 },
      { key: 'Notes', type: 'area', placeholder: 'Anything else I should know?', max: 240 },
    ],
  },
  {
    id: 'senior-mom-shirt',
    variantId: '44325866045499',
    handle: 'custom-senior-mom-photo-shirt-3',
    name: 'Custom Senior Mom Photo Shirt',
    short: 'Your senior’s photos in full color with their name, number and class year.',
    price: 30,
    kind: 'Photo shirt',
    method: 'DTF photo print',
    images: ['senior-shirt', 'class-2026', 'grad-set', 'cheer-mom'],
    tint: '#e3b04b',
    details: [
      'Personalized with your senior’s photos, name, number and class year',
      'Vibrant DTF print that stays soft and flexible',
      'Senior night, game days and graduation',
      'Matching tumblers available',
    ],
    fields: [
      { key: 'Size', type: 'chips', options: SIZES_ADULT, required: true },
      { key: 'Senior’s name', type: 'text', placeholder: 'Javier', max: 24, required: true },
      { key: 'Number', type: 'text', placeholder: '7', max: 3 },
      { key: 'Class year', type: 'chips', options: ['2026', '2027', '2028'] },
      { key: 'Notes', type: 'area', placeholder: 'Sport, school colors, wording. Photos go by email or Messenger after checkout.', max: 240 },
    ],
  },
  {
    id: 'name-tumbler',
    variantId: '44325858836539',
    handle: 'personalized-custom-name-tumbler-1',
    name: 'Personalized Name Tumbler',
    short: 'Sublimated by hand, so the design is part of the finish and never peels.',
    price: 30,
    kind: 'Tumbler',
    method: 'sublimation',
    images: ['tumbler-1', 'tumbler-2'],
    tint: '#f0428b',
    details: [
      'Personalized with a name, number or custom design',
      'Vibrant, long-lasting sublimation print',
      'Gifts, teams, seniors and game days',
      'Pairs with matching custom hoodies and tees',
    ],
    fields: [
      { key: 'Name on tumbler', type: 'text', placeholder: 'Ammie', max: 18, required: true, preview: true },
      { key: 'Theme', type: 'chips', options: ['Pink glitter', 'Team colors', 'Western', 'Floral', 'Surprise me'] },
      { key: 'Notes', type: 'area', placeholder: 'Colors, fonts, a photo you love…', max: 240 },
    ],
  },
]

// Made to order on request. These are on Ammie's Facebook but not yet on Shopify.
export const QUOTES = [
  { id: 'memorial', name: 'In loving memory shirts', from: 'Photo, dates and a few words', image: 'memorial-shirt' },
  { id: 'pendants', name: 'Angel-wing photo pendants', from: 'Heart and round styles', image: 'wing-pendants' },
  { id: 'grad', name: 'Graduation leis and sets', from: 'Money leis, stoles, photo fans', image: 'grad-set' },
  { id: 'coasters', name: 'Name coasters and ornaments', from: 'Family sets, party favors', image: 'name-coasters' },
  { id: 'team-tees', name: 'Team name shirts', from: 'Whole roster, one order', image: 'team-names' },
  { id: 'decals', name: 'Vinyl decals and car window prints', from: 'Names, logos, memorials', image: null },
]

// Occasions: what people bring to Ammie most, with the pieces that fit.
export const OCCASIONS = [
  {
    id: 'game', title: 'Game day', note: 'Jerseys, name sleeves, player banners',
    body: 'Jerseys with name sleeves, team tees for the whole roster and big player banners for the fence. Bring the colors, the numbers and the nicknames.',
    images: ['game-banner-1', 'team-names', 'jersey-1'], products: ['team-jersey'], quotes: ['team-tees'],
  },
  {
    id: 'senior', title: 'Senior year', note: 'Proud mom tees, leis, photo fans',
    body: 'Senior night shirts with their photos, money leis, stoles and photo fans for graduation day. Matching sets for the whole family.',
    images: ['grad-set', 'class-2026', 'senior-shirt'], products: ['senior-mom-shirt'], quotes: ['grad'],
  },
  {
    id: 'memory', title: 'In loving memory', note: 'Photo shirts, pendants, rosaries',
    body: 'Gentle, carefully made keepsakes with a photo, the dates and a few words. Shirts for the whole family, angel-wing pendants and photo rosaries.',
    images: ['memorial-shirt', 'wing-pendants', 'rosary'], products: [], quotes: ['memorial', 'pendants'],
  },
  {
    id: 'bling', title: 'Bling and nights out', note: 'Jackets, concert fits, crews',
    body: 'Jean jackets covered in names, photos and rhinestones. Birthday crews, bridal parties, concerts and cheer competitions.',
    images: ['jacket-1', 'jacket-3', 'stage-stars'], products: ['bling-jacket'], quotes: [],
  },
  {
    id: 'moms', title: 'Moms club', note: 'Tees for caffeine and chaos',
    body: 'Funny, sweet and a little bit feral. Mom tees for the bleachers, the school run and the group chat.',
    images: ['moms-club-pink', 'moms-club-black', 'cheer-mom'], products: ['senior-mom-shirt'], quotes: [],
  },
  {
    id: 'gifts', title: 'Gifts and holidays', note: 'Tumblers, coasters, ornaments',
    body: 'Name tumblers, family coaster sets and ornaments. The kind of gift people keep on the desk for years.',
    images: ['tumbler-1', 'name-coasters', 'tumbler-2'], products: ['name-tumbler'], quotes: ['coasters'],
  },
]

// Gallery: every photo is a real order from Ammie's Facebook page.
export const GALLERY_CATS = [
  ['all', 'Everything'], ['jackets', 'Jackets'], ['shirts', 'Shirts and jerseys'], ['drinkware', 'Tumblers'], ['keepsakes', 'Keepsakes'], ['prints', 'Prints'],
]
export const GALLERY_ITEMS = [
  ['jacket-1', 'jackets', 'Bling jean jacket with a photo collage back'],
  ['team-names', 'shirts', 'Name-down-the-back team shirts'],
  ['wing-pendants', 'keepsakes', 'Angel-wing photo pendants'],
  ['tumbler-2', 'drinkware', 'Sublimated tumbler'],
  ['moms-club-pink', 'shirts', 'Moms club tee'],
  ['jersey-1', 'shirts', 'Custom team jersey with name sleeve'],
  ['grad-set', 'keepsakes', 'Graduation lei and photo set'],
  ['jacket-4', 'jackets', 'Senior photo jacket'],
  ['dtf-transfers', 'prints', 'DTF transfers ready to press'],
  ['memorial-shirt', 'shirts', 'In loving memory photo shirt'],
  ['stage-stars', 'shirts', 'Dance team shirt'],
  ['tumbler-1', 'drinkware', 'Tumbler lineup'],
  ['rosary', 'keepsakes', 'Photo rosary'],
  ['senior-shirt', 'shirts', 'Senior mom photo shirt'],
  ['jacket-2', 'jackets', 'Cheer mom jacket with name sleeves'],
  ['name-coasters', 'keepsakes', 'Family name coasters'],
  ['game-banner-1', 'prints', 'Player banner'],
  ['cheer-mom', 'shirts', 'Cheer mom tee'],
  ['bandana-pendants', 'keepsakes', 'Bandana photo pendants'],
  ['jersey-2', 'shirts', 'Team jersey, front'],
  ['class-2026', 'shirts', 'Class of 2026 family shirts'],
  ['memorial-purple', 'shirts', 'Matching memorial shirts'],
  ['jacket-3', 'jackets', 'Distressed bling jacket'],
  ['team-photo-transfer', 'prints', 'Team photo transfer'],
  ['dance-shirt', 'shirts', 'Dance crew shirts'],
  ['wing-pendants-2', 'keepsakes', 'Heart photo pendants'],
  ['name-shirt', 'shirts', 'Name sleeve shirt'],
  ['game-banner-2', 'prints', 'Game day banner'],
  ['photo-tees', 'shirts', 'Photo tees'],
  ['bandana-pendant', 'keepsakes', 'Bandana pendant'],
  ['team-baby-t', 'shirts', 'Team Baby T tee'],
  ['memorial-shirt-2', 'shirts', 'Memorial shirt, back'],
  ['dtf-prints', 'prints', 'Fresh DTF prints'],
  ['moms-club-black', 'shirts', 'Moms club tee, black'],
  ['memorial-purple-2', 'shirts', 'Forever in our hearts shirts'],
].map(([image, cat, caption]) => ({ image, cat, caption }))

export const STEPS = [
  { t: 'Pick a piece', d: 'Choose a tumbler, jacket, jersey or photo shirt, or tell Ammie about something new you’ve been picturing.', im: 'jacket-2' },
  { t: 'Add your details', d: 'Names, numbers, colors and wording go in right on the product page. Photos come after checkout.', im: 'team-names' },
  { t: 'Ammie designs and presses it', d: 'Every design is made for your order, printed with DTF or sublimation and finished by hand.', im: 'dtf-transfers' },
  { t: 'Wear it, gift it, keep it', d: 'Your piece heads your way, ready for game day, senior night or the people you miss.', im: 'class-2026' },
]

export const CATEGORIES = { 'bling-jacket': 'apparel', 'team-jersey': 'apparel', 'senior-mom-shirt': 'apparel', 'name-tumbler': 'drinkware' }

export const img = (name, small = false) => `/img/${name}${small ? '-sm' : ''}.webp`
