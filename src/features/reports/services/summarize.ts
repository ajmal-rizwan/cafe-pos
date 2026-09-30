import type { Order, PaymentMethod } from '../../../db/types'
import type { Minor } from '../../../shared/lib/money'

// Pure report maths: orders in, numbers out. No database access here, so
// the same functions can run on a backend later.

export interface ItemSales {
  name: string
  size: string
  qty: number
  revenue: Minor
}

export interface DaySales {
  date: string // YYYY-MM-DD, local time
  orders: number
  total: Minor
}

export interface Summary {
  orders: number
  total: Minor
  average: Minor
  byPayment: Record<PaymentMethod, Minor>
  eatIn: number
  takeaway: number
  itemsSold: number
  topItems: ItemSales[]
}

export function summarize(orders: Order[], topN = 10): Summary {
  const byPayment: Record<PaymentMethod, Minor> = { cash: 0, card: 0 }
  const items = new Map<string, ItemSales>()
  let total = 0
  let eatIn = 0
  let itemsSold = 0

  for (const o of orders) {
    total += o.total
    byPayment[o.payment] += o.total
    if (o.mode === 'eat-in') eatIn++

    for (const l of o.lines) {
      itemsSold += l.qty
      const key = `${l.productId}:${l.size}`
      const row = items.get(key) ?? { name: l.name, size: l.size, qty: 0, revenue: 0 }
      row.qty += l.qty
      row.revenue += l.unitPrice * l.qty
      items.set(key, row)
    }
  }

  return {
    orders: orders.length,
    total,
    average: orders.length ? Math.round(total / orders.length) : 0,
    byPayment,
    eatIn,
    takeaway: orders.length - eatIn,
    itemsSold,
    topItems: [...items.values()].sort((a, b) => b.qty - a.qty || b.revenue - a.revenue).slice(0, topN),
  }
}

// One row per day of the month, including days with no sales.
export function salesByDay(orders: Order[], monthStart: Date): DaySales[] {
  const days: DaySales[] = []
  const cursor = new Date(monthStart)
  while (cursor.getMonth() === monthStart.getMonth()) {
    days.push({ date: dayKey(cursor), orders: 0, total: 0 })
    cursor.setDate(cursor.getDate() + 1)
  }
  const index = new Map(days.map((d) => [d.date, d]))
  for (const o of orders) {
    const day = index.get(dayKey(new Date(o.createdAt)))
    if (day) {
      day.orders++
      day.total += o.total
    }
  }
  return days
}

export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
