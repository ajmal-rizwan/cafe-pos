import { useState } from 'react'
import type { Product, ProductSize } from '../../db/types'
import type { Minor } from '../../shared/lib/money'
import { CashDialog } from './components/CashDialog'
import { MenuGrid } from './components/MenuGrid'
import { OrderPanel, type PaidSale } from './components/OrderPanel'
import { TopBar } from './components/TopBar'
import { useCart } from './hooks/useCart'
import { useTillStats } from './hooks/useTillStats'
import { recordSale } from './services/recordSale'
import './TillScreen.css'

export function TillScreen({ onOpenReports }: { onOpenReports: () => void }) {
  const cart = useCart()
  const { nextNumber, todaysTotal } = useTillStats()
  const [takingCash, setTakingCash] = useState(false)
  const [lastSale, setLastSale] = useState<PaidSale | null>(null)

  const confirmCash = async (tendered: Minor) => {
    const order = await recordSale(cart.lines, cart.mode, 'cash', tendered)
    setTakingCash(false)
    cart.clear()
    setLastSale({ number: order.number, total: order.total, tendered, change: order.change ?? 0 })
  }

  // Starting the next order clears the change message.
  const addItem = (product: Product, size: ProductSize) => {
    setLastSale(null)
    cart.add(product, size)
  }

  return (
    <div className="till">
      <TopBar todaysTotal={todaysTotal} onOpenReports={onOpenReports} />
      <div className="till__body">
        <MenuGrid onAdd={addItem} />
        <OrderPanel
          cart={cart}
          orderNumber={nextNumber}
          onPayCash={() => setTakingCash(true)}
          lastSale={lastSale}
        />
      </div>
      {takingCash && (
        <CashDialog total={cart.total} onConfirm={confirmCash} onCancel={() => setTakingCash(false)} />
      )}
    </div>
  )
}
