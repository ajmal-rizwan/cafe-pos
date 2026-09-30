import { config } from '../../../config'
import { formatAmount, formatMoney, vatFromGross } from '../../../shared/lib/money'
import type { Cart } from '../hooks/useCart'
import './OrderPanel.css'

interface Props {
  cart: Cart
  orderNumber: number
  onPayCash: () => void
}

export function OrderPanel({ cart, orderNumber, onPayCash }: Props) {
  const empty = cart.lines.length === 0

  return (
    <aside className="order" aria-label="Current order">
      <div className="order__head">
        <h2>Order #{String(orderNumber).padStart(4, '0')}</h2>
        <div className="toggle">
          <button aria-pressed={cart.mode === 'eat-in'} onClick={() => cart.setMode('eat-in')}>
            Eat in
          </button>
          <button aria-pressed={cart.mode === 'takeaway'} onClick={() => cart.setMode('takeaway')}>
            Takeaway
          </button>
        </div>
      </div>

      <div className="lines">
        {empty && <p className="lines__empty">No items yet</p>}
        {cart.lines.map((l) => (
          <div key={l.key} className="line">
            <div className="line__info">
              <div className="line__name">
                {l.name}
                {l.size && <span className="line__size">{l.size}</span>}
              </div>
              <div className="line__unit">
                {l.code ? `#${l.code} · ` : ''}
                {formatAmount(l.unitPrice)} each
              </div>
            </div>
            <div className="qty">
              <button aria-label={`Remove one ${l.name}`} onClick={() => cart.changeQty(l.key, -1)}>
                −
              </button>
              <span>{l.qty}</span>
              <button aria-label={`Add one ${l.name}`} onClick={() => cart.changeQty(l.key, 1)}>
                +
              </button>
            </div>
            <div className="line__total">{formatAmount(l.unitPrice * l.qty)}</div>
          </div>
        ))}
      </div>

      <div className="totals">
        <div className="totals__row"><span>Items</span><span>{cart.count}</span></div>
        {config.vatRate > 0 && (
          <div className="totals__row"><span>VAT included</span><span>{formatMoney(vatFromGross(cart.total))}</span></div>
        )}
        <div className="totals__grand"><span>Total</span><strong>{formatMoney(cart.total)}</strong></div>
      </div>

      <div className="pay">
        <button className="pay__cash" disabled={empty} onClick={onPayCash}>Cash</button>
        {/* TODO: wire to the payments feature once a card reader is chosen */}
        <button className="pay__card" disabled title="Card reader not connected yet">Card</button>
      </div>

      <button className="order__clear" disabled={empty} onClick={cart.clear}>Clear order</button>
    </aside>
  )
}
