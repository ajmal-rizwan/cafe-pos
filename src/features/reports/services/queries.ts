import { db } from '../../../db/db'
import type { Order } from '../../../db/types'

export type Period = 'day' | 'month'

// Start (inclusive) and end (exclusive) of the day or month containing `anchor`,
// in the device's local time.
export function periodRange(period: Period, anchor: Date): { start: Date; end: Date } {
  if (period === 'day') {
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate())
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    return { start, end }
  }
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1)
  return { start, end }
}

export function shiftPeriod(period: Period, anchor: Date, step: number): Date {
  const next = new Date(anchor)
  if (period === 'day') next.setDate(next.getDate() + step)
  else next.setMonth(next.getMonth() + step, 1)
  return next
}

export function ordersBetween(start: Date, end: Date): Promise<Order[]> {
  return db.orders.where('createdAt').between(start.getTime(), end.getTime(), true, false).toArray()
}
