import { config } from '../../../config'
import { db } from '../../../db/db'
import type { Order, OrderLine, OrderMode, PaymentMethod } from '../../../db/types'

// Saves a paid order locally. Works with no internet; `synced: 0` marks it
// for the backend sync to pick up later.
export async function recordSale(
  lines: OrderLine[],
  mode: OrderMode,
  payment: PaymentMethod,
): Promise<Order> {
  return db.transaction('rw', db.orders, async () => {
    const last = await db.orders.orderBy('number').last()
    const order: Order = {
      id: crypto.randomUUID(),
      tillId: config.tillId,
      number: (last?.number ?? 0) + 1,
      createdAt: Date.now(),
      mode,
      lines,
      total: lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0),
      payment,
      synced: 0,
    }
    await db.orders.add(order)
    return order
  })
}
