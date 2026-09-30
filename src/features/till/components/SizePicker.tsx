import { useEffect } from 'react'
import type { Product, ProductSize } from '../../../db/types'
import { formatMoney } from '../../../shared/lib/money'
import './SizePicker.css'

interface Props {
  product: Product
  onPick: (size: ProductSize) => void
  onClose: () => void
}

// Shown when an item comes in more than one size. One tap on a size adds it.
export function SizePicker({ product, onPick, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="sizes__backdrop" onClick={onClose}>
      <div
        className="sizes"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sizes-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sizes__head">
          {product.code && <span className="sizes__code">{product.code}</span>}
          <h3 id="sizes-title">{product.name}</h3>
        </div>
        <div className="sizes__options">
          {product.sizes.map((s) => (
            <button key={s.label} className="sizes__option" onClick={() => onPick(s)} autoFocus={s === product.sizes[0]}>
              <span className="sizes__label">{s.label}</span>
              <span className="sizes__price">{formatMoney(s.price)}</span>
            </button>
          ))}
        </div>
        <button className="sizes__cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  )
}
