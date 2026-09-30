import { useEffect, useState } from 'react'
import { CASH_NOTES, formatAmount, formatMoney, parseAmount, type Minor } from '../../../shared/lib/money'
import './CashDialog.css'

interface Props {
  total: Minor
  onConfirm: (tendered: Minor) => void
  onCancel: () => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫']

// Quick buttons: exact amount, the next whole rial, then any note that covers
// the total. One tap on these completes the sale; the keypad is for odd amounts.
function quickAmounts(total: Minor): Minor[] {
  const nextWhole = Math.ceil(total / 1000) * 1000
  const options = [total, nextWhole, ...CASH_NOTES.filter((n) => n >= total)]
  return [...new Set(options)].sort((a, b) => a - b).slice(0, 5)
}

export function CashDialog({ total, onConfirm, onCancel }: Props) {
  const [entry, setEntry] = useState('')
  const tendered = entry === '' ? null : parseAmount(entry)
  const enough = tendered !== null && tendered >= total
  const change = enough ? tendered - total : 0

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const press = (key: string) => {
    if (key === '⌫') return setEntry((e) => e.slice(0, -1))
    const next = entry + key
    // Only accept input that is still a valid amount (max 3 decimals, one dot).
    if (/^\d{0,6}(\.\d{0,3})?$/.test(next)) setEntry(next)
  }

  return (
    <div className="cash__backdrop" onClick={onCancel}>
      <div
        className="cash"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cash-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cash__summary">
          <h3 id="cash-title">Cash payment</h3>

          <div className="cash__row">
            <span>Total</span>
            <strong>{formatMoney(total)}</strong>
          </div>
          <div className="cash__row">
            <span>Given</span>
            <strong className="cash__given">{entry === '' ? '–' : entry}</strong>
          </div>

          <div className={enough ? 'cash__change' : 'cash__change cash__change--due'} aria-live="polite">
            <span>{enough || tendered === null ? 'Change' : 'Still due'}</span>
            <strong>
              {tendered === null
                ? '–'
                : enough
                  ? formatMoney(change)
                  : formatMoney(total - (tendered ?? 0))}
            </strong>
          </div>

          <p className="cash__hint">Tap what the customer gave</p>
          <div className="cash__quick">
            {quickAmounts(total).map((amount) => (
              <button key={amount} onClick={() => onConfirm(amount)}>
                {amount === total ? 'Exact' : formatAmount(amount)}
              </button>
            ))}
          </div>
        </div>

        <div className="cash__side">
          <div className="cash__keypad">
            {KEYS.map((k) => (
              <button key={k} onClick={() => press(k)} aria-label={k === '⌫' ? 'Delete' : undefined}>
                {k}
              </button>
            ))}
          </div>
          <div className="cash__actions">
            <button className="cash__cancel" onClick={onCancel}>
              Cancel
            </button>
            <button className="cash__confirm" disabled={!enough} onClick={() => tendered !== null && onConfirm(tendered)}>
              {enough ? `Done · change ${formatAmount(change)}` : 'Enter amount'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
