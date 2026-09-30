import { config } from '../../../config'
import { useOnline } from '../../../shared/hooks/useOnline'
import { formatMoney, type Minor } from '../../../shared/lib/money'
import './TopBar.css'

interface Props {
  todaysTotal: Minor
  onOpenReports: () => void
}

export function TopBar({ todaysTotal, onOpenReports }: Props) {
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
        <button className="topbar__btn" onClick={onOpenReports}>
          Reports
        </button>
      </div>
    </header>
  )
}
