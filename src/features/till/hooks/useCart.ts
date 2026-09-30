import { useMemo, useState } from 'react'
import type { OrderLine, OrderMode, Product, ProductSize } from '../../../db/types'

// The order being built. In memory only; it's saved when it's paid.
export function useCart() {
  const [lines, setLines] = useState<OrderLine[]>([])
  const [mode, setMode] = useState<OrderMode>('eat-in')

  const add = (product: Product, size: ProductSize) => {
    const key = `${product.id}:${size.label}`
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key)
      if (existing) {
        return prev.map((l) => (l === existing ? { ...l, qty: l.qty + 1 } : l))
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          code: product.code,
          name: product.name,
          size: size.label,
          unitPrice: size.price,
          qty: 1,
        },
      ]
    })
  }

  const changeQty = (key: string, delta: number) =>
    setLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0),
    )

  const clear = () => setLines([])

  const { total, count } = useMemo(
    () => ({
      total: lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0),
      count: lines.reduce((sum, l) => sum + l.qty, 0),
    }),
    [lines],
  )

  return { lines, mode, setMode, add, changeQty, clear, total, count }
}

export type Cart = ReturnType<typeof useCart>
