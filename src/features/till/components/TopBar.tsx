import { config } from '../../../config'
import { useOnline } from '../../../shared/hooks/useOnline'
import { formatMoney, type Minor } from '../../../shared/lib/money'
import './TopBar.css'

export function TopBar({ todaysTotal }: { todaysTotal: Minor }) {
  const online = useOnline()

  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="topbar__name">{config.cafeName}</span>
        <span className="topbar__muted">{config.tillLabel}</span>
      </div>
      <div className="topbar__right">
        <span className="topbar__muted">Today {formatMoney(todaysTotal)}</span>
        <span className={online ? 'status status--on' : 'status status--off'}>
          {online ? 'Online' : 'Offline · saving locally'}
        </span>
      </div>
    </header>
  )
}
