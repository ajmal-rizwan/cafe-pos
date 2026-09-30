import type { Minor } from '../shared/lib/money'

export interface Category {
  id: string
  name: string
  sort: number
}

export interface ProductSize {
  label: string // 'S' | 'M' | 'L' | '12 pcs'… ; '' when there's only one size
  price: Minor
}

export interface Product {
  id: string
  code?: number // number printed on the menu, e.g. 267 for Karak Tea; specials have none
  categoryId: string
  name: string
  sizes: ProductSize[] // always at least one
  sort: number
  active: boolean
}

export interface OrderLine {
  key: string // productId + size, so a small and a large karak are separate lines
  productId: string
  code?: number
  name: string // snapshot, so old receipts don't change if the menu does
  size: string
  unitPrice: Minor
  qty: number
}

export type PaymentMethod = 'cash' | 'card'
export type OrderMode = 'eat-in' | 'takeaway'

export interface Order {
  id: string // uuid, generated on the device so it works offline
  tillId: string
  number: number // short number shown to customers
  createdAt: number
  mode: OrderMode
  lines: OrderLine[]
  total: Minor
  payment: PaymentMethod
  synced: 0 | 1 // 0 until the backend has it (IndexedDB can't index booleans)
}
