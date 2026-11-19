// The scroll story. Section heights are in viewport heights (vh); the 3D
// choreography in scene/choreography.js is keyed to the same numbers.
export const SECTIONS = [
  { id: 'hero', vh: 100 },
  { id: 'intro', vh: 150 },
  { id: 'tumbler', vh: 200 },
  { id: 'making', vh: 300 },
  { id: 'jacket', vh: 200 },
  { id: 'jersey', vh: 200 },
  { id: 'senior', vh: 200 },
  { id: 'closing', vh: 100 },
]

export const START = SECTIONS.reduce((acc, s, i) => {
  acc[s.id] = i === 0 ? 0 : acc[SECTIONS[i - 1].id] + SECTIONS[i - 1].vh
  return acc
}, {})
export const TOTAL = START.closing // scrollable distance in vh

export const CHAPTERS = [
  {
    id: 'tumbler',
    productId: 'name-tumbler',
    word: 'TUMBLER',
    bg: '#f7e1dd',
    accent: '#d6336c',
    pill: 'Made to order',
    kicker: 'Sublimated by hand',
    title: ['Name', 'Tumbler'],
    meta: '$30 · ready to gift',
    body: 'Your name, your team or your favorite design, sublimated into the finish so it never peels. Ammie presses every one herself, one order at a time.',
    tags: ['Any name', 'Sublimation', 'Never peels', 'Gift ready'],
    tryName: true,
  },
  {
    id: 'jacket',
    productId: 'bling-jacket',
    word: 'BLING',
    bg: '#eedcea',
    accent: '#a23b9e',
    pill: 'Made to order',
    kicker: 'DTF print and rhinestones',
    title: ['Bling Jean', 'Jacket'],
    meta: '$75 · sizes XS to 3XL',
    body: 'Names, photos and your crew’s colors across the back, finished with as much rhinestone sparkle as you can handle. Made for cheer moms, birthdays and big nights out.',
    tags: ['Back design', 'Rhinestones', 'Photo print', 'Group orders'],
    image: 'jacket-1',
  },
  {
    id: 'jersey',
    productId: 'team-jersey',
    word: 'TEAM',
    bg: '#e4efd6',
    accent: '#4c8a1c',
    pill: 'Made to order',
    kicker: 'Bold DTF print',
    title: ['Team Jersey', 'with Name Sleeve'],
    meta: '$60 · youth to 3XL',
    body: 'Team, logo or artist on the front, a name or number down the sleeve, all in your colors. Soft, bold and made to survive every game day of the season.',
    tags: ['Team colors', 'Name sleeve', 'Numbers', 'Roster orders'],
    image: 'jersey-1',
  },
  {
    id: 'senior',
    productId: 'senior-mom-shirt',
    word: 'SENIOR',
    bg: '#f6e3c8',
    accent: '#c26a12',
    pill: 'Senior season',
    kicker: 'Full-color photo print',
    title: ['Senior Mom', 'Photo Shirt'],
    meta: '$30 · class of 2026 and up',
    body: 'Your senior’s photos in full color with their name, number and class year. Made for senior night, the bleachers and every proud moment after.',
    tags: ['Photo print', 'Name and number', 'Class year', 'Matching tumblers'],
    image: 'senior-shirt',
  },
]

export const MAKING = [
  { word: 'DTF Print', note: 'Ink printed onto film, pressed into cotton and denim', flock: 'ink' },
  { word: 'Sublimation', note: 'Ink turned to gas, bonded into the finish', flock: 'ink2' },
  { word: 'Rhinestones', note: 'Placed by hand, one sparkle at a time', flock: 'gems' },
  { word: 'Heat Press', note: 'The final squeeze that makes it last', flock: 'steam' },
]
