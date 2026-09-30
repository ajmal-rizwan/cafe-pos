import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db } from '../../../db/db'
import type { Product, ProductSize } from '../../../db/types'
import { formatAmount } from '../../../shared/lib/money'
import { CategoryTabs } from './CategoryTabs'
import { SizePicker } from './SizePicker'
import './MenuGrid.css'

export function MenuGrid({ onAdd }: { onAdd: (p: Product, size: ProductSize) => void }) {
  const categories = useLiveQuery(() => db.categories.orderBy('sort').toArray(), [], [])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [picking, setPicking] = useState<Product | null>(null)
  const activeId = selectedId ?? categories[0]?.id ?? null

  const products = useLiveQuery(
    () =>
      activeId
        ? db.products
            .where('[categoryId+sort]')
            .between([activeId, -Infinity], [activeId, Infinity])
            .filter((p) => p.active)
            .toArray()
        : [],
    [activeId],
    [],
  )

  const tap = (p: Product) => (p.sizes.length === 1 ? onAdd(p, p.sizes[0]) : setPicking(p))

  return (
    <main className="menu">
      <CategoryTabs categories={categories} activeId={activeId} onSelect={setSelectedId} />

      <div className="grid">
        {products.map((p) => (
          <button key={p.id} className="item" onClick={() => tap(p)}>
            <span className="item__top">
              <span className="item__code">{p.code ?? ''}</span>
              {p.sizes.length > 1 && <span className="item__sizes">{p.sizes.map((s) => s.label).join(' · ')}</span>}
            </span>
            <span className="item__name">{p.name}</span>
            <span className="item__price">{p.sizes.map((s) => formatAmount(s.price)).join(' / ')}</span>
          </button>
        ))}
      </div>

      {picking && (
        <SizePicker
          product={picking}
          onPick={(size) => {
            onAdd(picking, size)
            setPicking(null)
          }}
          onClose={() => setPicking(null)}
        />
      )}
    </main>
  )
}
