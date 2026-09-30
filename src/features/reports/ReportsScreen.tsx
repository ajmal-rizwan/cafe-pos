import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { formatAmount, formatMoney } from '../../shared/lib/money'
import { csvFilename, downloadCsv, ordersToCsv } from './services/exportCsv'
import { ordersBetween, periodRange, shiftPeriod, type Period } from './services/queries'
import { dayKey, salesByDay, summarize } from './services/summarize'
import './ReportsScreen.css'

const dayLabel = (d: Date) =>
  d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
const monthLabel = (d: Date) => d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
const timeLabel = (ms: number) =>
  new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

export function ReportsScreen({ onBack }: { onBack: () => void }) {
  const [period, setPeriod] = useState<Period>('day')
  // "Now" is fixed when the screen opens; reopening Reports refreshes it.
  const [now] = useState(() => new Date())
  const [anchor, setAnchor] = useState(now)

  const { start, end } = periodRange(period, anchor)
  const startMs = start.getTime()
  const endMs = end.getTime()
  const orders = useLiveQuery(() => ordersBetween(new Date(startMs), new Date(endMs)), [startMs, endMs], [])
  // A day or month of cafe orders is small; no need to memoise this.
  const summary = summarize(orders)
  const days = period === 'month' ? salesByDay(orders, start) : []

  const isCurrent = periodRange(period, now).start.getTime() === startMs
  const label = period === 'day' ? dayLabel(start) : monthLabel(start)

  const exportCsv = () =>
    downloadCsv(ordersToCsv(orders), csvFilename(period === 'day' ? dayKey(start) : dayKey(start).slice(0, 7)))

  const openDay = (date: string) => {
    const [y, m, d] = date.split('-').map(Number)
    setAnchor(new Date(y, m - 1, d))
    setPeriod('day')
  }

  return (
    <div className="reports">
      <header className="reports__bar">
        <button className="reports__back" onClick={onBack}>
          ← Till
        </button>
        <h1>Reports</h1>
        <div className="reports__tabs" role="tablist" aria-label="Report period">
          <button role="tab" aria-selected={period === 'day'} onClick={() => setPeriod('day')}>
            Daily
          </button>
          <button role="tab" aria-selected={period === 'month'} onClick={() => setPeriod('month')}>
            Monthly
          </button>
        </div>
      </header>

      <div className="reports__body">
        <div className="reports__nav">
          <div className="reports__date">
            <button aria-label="Previous" onClick={() => setAnchor(shiftPeriod(period, anchor, -1))}>‹</button>
            <span>{label}</span>
            <button aria-label="Next" disabled={isCurrent} onClick={() => setAnchor(shiftPeriod(period, anchor, 1))}>›</button>
          </div>
          {!isCurrent && (
            <button className="reports__link" onClick={() => setAnchor(now)}>
              {period === 'day' ? 'Today' : 'This month'}
            </button>
          )}
          <button className="reports__export" disabled={orders.length === 0} onClick={exportCsv}>
            Export CSV
          </button>
        </div>

        <section className="tiles" aria-label="Summary">
          <div className="tile tile--main">
            <span className="tile__label">Total sales</span>
            <strong className="tile__value">{formatMoney(summary.total)}</strong>
          </div>
          <div className="tile">
            <span className="tile__label">Orders</span>
            <strong className="tile__value">{summary.orders}</strong>
          </div>
          <div className="tile">
            <span className="tile__label">Average order</span>
            <strong className="tile__value">{formatAmount(summary.average)}</strong>
          </div>
          <div className="tile">
            <span className="tile__label">Cash</span>
            <strong className="tile__value">{formatAmount(summary.byPayment.cash)}</strong>
          </div>
          <div className="tile">
            <span className="tile__label">Card</span>
            <strong className="tile__value">{formatAmount(summary.byPayment.card)}</strong>
          </div>
          <div className="tile">
            <span className="tile__label">Eat in · Takeaway</span>
            <strong className="tile__value">
              {summary.eatIn} · {summary.takeaway}
            </strong>
          </div>
        </section>

        {orders.length === 0 ? (
          <p className="reports__empty">No sales {period === 'day' ? 'on this day' : 'in this month'}.</p>
        ) : (
          <div className="reports__cols">
            <section className="panel">
              <h2>Best sellers</h2>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Item</th>
                    <th scope="col" className="num">Qty</th>
                    <th scope="col" className="num">Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.topItems.map((it) => (
                    <tr key={`${it.name}:${it.size}`}>
                      <td>
                        {it.name}
                        {it.size && <span className="size">{it.size}</span>}
                      </td>
                      <td className="num">{it.qty}</td>
                      <td className="num">{formatAmount(it.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {period === 'month' ? (
              <section className="panel">
                <h2>Sales by day</h2>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Day</th>
                      <th scope="col" className="num">Orders</th>
                      <th scope="col" className="num">Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((d) => (
                      <tr key={d.date} className={d.orders ? '' : 'muted'}>
                        <td>
                          {d.orders ? (
                            <button className="reports__daylink" onClick={() => openDay(d.date)}>
                              {dayLabel(new Date(d.date + 'T00:00'))}
                            </button>
                          ) : (
                            dayLabel(new Date(d.date + 'T00:00'))
                          )}
                        </td>
                        <td className="num">{d.orders || '–'}</td>
                        <td className="num">{d.orders ? formatAmount(d.total) : '–'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ) : (
              <section className="panel">
                <h2>Orders</h2>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Time</th>
                      <th scope="col">Order</th>
                      <th scope="col">Payment</th>
                      <th scope="col" className="num">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...orders].reverse().map((o) => (
                      <tr key={o.id}>
                        <td>{timeLabel(o.createdAt)}</td>
                        <td>
                          #{String(o.number).padStart(4, '0')}
                          <span className="muted-text"> · {o.lines.reduce((n, l) => n + l.qty, 0)} items</span>
                        </td>
                        <td className="cap">{o.payment}</td>
                        <td className="num">{formatAmount(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
