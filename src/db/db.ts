import Dexie, { type EntityTable } from 'dexie'
import type { Category, Order, Product } from './types'

// Local-first: the till reads and writes here. Backend sync comes later.
// To change the schema, add a new db.version(n) below; never edit old ones.
export const db = new Dexie('cafe-pos') as Dexie & {
  categories: EntityTable<Category, 'id'>
  products: EntityTable<Product, 'id'>
  orders: EntityTable<Order, 'id'>
}

db.version(1).stores({
  categories: 'id, sort',
  products: 'id, categoryId, active',
  orders: 'id, number, createdAt, synced',
})

// v2: products gain menu codes and sizes. The old sample menu is wiped here
// and seedIfEmpty() loads the real one on the next start.
db.version(2)
  .stores({
    categories: 'id, sort',
    products: 'id, &code, categoryId, [categoryId+sort], active',
    orders: 'id, number, createdAt, synced',
  })
  .upgrade(async (tx) => {
    await tx.table('products').clear()
    await tx.table('categories').clear()
  })
