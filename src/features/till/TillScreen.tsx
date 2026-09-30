import { useState } from 'react'
import { Toast } from '../../shared/components/Toast'
import { useToast } from '../../shared/hooks/useToast'
import { formatMoney, type Minor } from '../../shared/lib/money'
import { CashDialog } from './components/CashDialog'
import { MenuGrid } from './components/MenuGrid'
import { OrderPanel } from './components/OrderPanel'
import { TopBar } from './components/TopBar'
import { useCart } from './hooks/useCart'
import { useTillStats } from './hooks/useTillStats'
import { recordSale } from './services/recordSale'
import './TillScreen.css'

export function TillScreen({ onOpenReports }: { onOpenReports: () => void }) {
  const cart = useCart()
  const { nextNumber, todaysTotal } = useTillStats()
  const toast = useToast()
  const [takingCash, setTakingCash] = useState(false)

  const confirmCash = async (tendered: Minor) => {
    const order = await recordSale(cart.lines, cart.mode, 'cash', tendered)
    setTakingCash(false)
    cart.clear()
    toast.show(`Order #${order.number} paid · change ${formatMoney(order.change ?? 0)}`)
  }

  return (
    <div className="till">
      <TopBar todaysTotal={todaysTotal} onOpenReports={onOpenReports} />
      <div className="till__body">
        <MenuGrid onAdd={cart.add} />
        <OrderPanel cart={cart} orderNumber={nextNumber} onPayCash={() => setTakingCash(true)} />
      </div>
      {takingCash && (
        <CashDialog total={cart.total} onConfirm={confirmCash} onCancel={() => setTakingCash(false)} />
      )}
      <Toast message={toast.message} />
    </div>
  )
}
