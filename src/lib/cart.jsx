import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { PRODUCTS, STORE } from '../data/catalog'

const CartCtx = createContext(null)
const KEY = 'ammies-bag-v1'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState(load)
  const [open, setOpen] = useState(false)
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(lines)) } catch { /* private mode */ }
  }, [lines])

  const add = useCallback((productId, options, qty = 1) => {
    setLines((ls) => [...ls, { key: `${productId}-${Date.now()}`, productId, options, qty }])
    setPulse((p) => p + 1)
  }, [])
  const remove = useCallback((key) => setLines((ls) => ls.filter((l) => l.key !== key)), [])
  const setQty = useCallback((key, qty) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(50, qty)) } : l))), [])
  const clear = useCallback(() => setLines([]), [])

  const value = useMemo(() => {
    const items = lines.map((l) => ({ ...l, product: PRODUCTS.find((p) => p.id === l.productId) })).filter((l) => l.product)
    const count = items.reduce((n, l) => n + l.qty, 0)
    const subtotal = items.reduce((n, l) => n + l.qty * l.product.price, 0)
    return { items, count, subtotal, add, remove, setQty, clear, open, setOpen, pulse }
  }, [lines, add, remove, setQty, clear, open, pulse])

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}

export const useCart = () => useContext(CartCtx)

/**
 * Builds one Shopify cart permalink for the whole bag:
 *   /cart/VARIANT:QTY,VARIANT:QTY?note=...
 * Shopify merges repeated variants, so personalization for every line goes into the
 * order note, which Ammie sees on the order details page.
 */
export function checkoutUrl(items) {
  const qtyByVariant = new Map()
  items.forEach((l) => qtyByVariant.set(l.product.variantId, (qtyByVariant.get(l.product.variantId) || 0) + l.qty))
  const path = [...qtyByVariant].map(([v, q]) => `${v}:${q}`).join(',')

  const note = items
    .map((l, i) => {
      const opts = Object.entries(l.options)
        .filter(([, v]) => v && String(v).trim())
        .map(([k, v]) => `${k}: ${String(v).trim()}`)
        .join(' | ')
      return `${i + 1}. ${l.product.name} x${l.qty}${opts ? ` | ${opts}` : ''}`
    })
    .join('\n')

  const fullNote = `${note}\n\nPhotos: reply to the order email or message Ammie on Facebook.`.slice(0, 1800)
  return `${STORE.shopifyDomain}/cart/${path}?note=${encodeURIComponent(fullNote)}&ref=ammies-new-site`
}

export const money = (n) => `$${n.toFixed(2).replace(/\.00$/, '')}`
