import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../db/db'

// Live figures for the till header and order number. Re-run automatically
// whenever the orders table changes.
export function useTillStats() {
  const nextNumber = useLiveQuery(
    async () => ((await db.orders.orderBy('number').last())?.number ?? 0) + 1,
    [],
    1,
  )

  const todaysTotal = useLiveQuery(
    async () => {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const orders = await db.orders.where('createdAt').aboveOrEqual(start.getTime()).toArray()
      return orders.reduce((sum, o) => sum + o.total, 0)
    },
    [],
    0,
  )

  return { nextNumber, todaysTotal }
}
