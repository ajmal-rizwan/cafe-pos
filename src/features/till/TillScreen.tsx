import { Toast } from '../../shared/components/Toast'
import { useToast } from '../../shared/hooks/useToast'
import { formatMoney } from '../../shared/lib/money'
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

  const payCash = async () => {
    const order = await recordSale(cart.lines, cart.mode, 'cash')
    cart.clear()
    toast.show(`Order #${order.number} paid · ${formatMoney(order.total)} cash`)
  }

  return (
    <div className="till">
      <TopBar todaysTotal={todaysTotal} onOpenReports={onOpenReports} />
      <div className="till__body">
        <MenuGrid onAdd={cart.add} />
        <OrderPanel cart={cart} orderNumber={nextNumber} onPayCash={payCash} />
      </div>
      <Toast message={toast.message} />
    </div>
  )
}
