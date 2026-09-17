import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'quicky_cart'

function readStoredCart() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { shop: null, items: [] }
    }
    const parsed = JSON.parse(raw)
    return {
      shop: parsed.shop ?? null,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    }
  } catch {
    return { shop: null, items: [] }
  }
}

export function CartProvider({ children }) {
  const [shop, setShop] = useState(null)
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = readStoredCart()
    setShop(stored.shop)
    setItems(stored.items)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) {
      return
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ shop, items }))
  }, [shop, items, ready])

  function addItem(nextShop, menuItem, quantity = 1) {
    if (shop && shop.id !== nextShop.id && items.length > 0) {
      const replace = window.confirm(
        `Your cart has items from ${shop.name}. Replace it with items from ${nextShop.name}?`,
      )
      if (!replace) {
        return { ok: false, reason: 'different_shop' }
      }
      setShop({
        id: nextShop.id,
        name: nextShop.name,
        slug: nextShop.slug,
        is_open: nextShop.is_open,
      })
      setItems([
        {
          id: menuItem.id,
          name: menuItem.name,
          price: Number(menuItem.price),
          image_url: menuItem.image_url,
          quantity,
        },
      ])
      return { ok: true, replaced: true }
    }

    setShop({
      id: nextShop.id,
      name: nextShop.name,
      slug: nextShop.slug,
      is_open: nextShop.is_open,
    })

    setItems((current) => {
      const existing = current.find((item) => item.id === menuItem.id)
      if (existing) {
        return current.map((item) =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }
      return [
        ...current,
        {
          id: menuItem.id,
          name: menuItem.name,
          price: Number(menuItem.price),
          image_url: menuItem.image_url,
          quantity,
        },
      ]
    })

    return { ok: true, replaced: false }
  }

  function updateQuantity(itemId, quantity) {
    const nextQuantity = Number(quantity)
    if (nextQuantity <= 0) {
      removeItem(itemId)
      return
    }
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, quantity: nextQuantity } : item,
      ),
    )
  }

  function removeItem(itemId) {
    setItems((current) => {
      const next = current.filter((item) => item.id !== itemId)
      if (next.length === 0) {
        setShop(null)
      }
      return next
    })
  }

  function clearCart() {
    setShop(null)
    setItems([])
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const value = {
    ready,
    shop,
    items,
    itemCount,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
