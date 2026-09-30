import { config } from '../../../config'
import type { Order } from '../../../db/types'
import { formatAmount } from '../../../shared/lib/money'

// One row per line item, so it opens cleanly in Excel or Google Sheets.
// Also the till's backup until there's a server: export it regularly.
export function ordersToCsv(orders: Order[]): string {
  const header = ['order_no', 'date', 'time', 'mode', 'payment', 'code', 'item', 'size', 'qty', 'unit_price', 'line_total', 'order_total', 'cash_given', 'change']
  const rows = orders.flatMap((o) => {
    const d = new Date(o.createdAt)
    const date = d.toLocaleDateString('en-GB')
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    return o.lines.map((l) => [
      o.number,
      date,
      time,
      o.mode,
      o.payment,
      l.code ?? '',
      l.name,
      l.size,
      l.qty,
      formatAmount(l.unitPrice),
      formatAmount(l.unitPrice * l.qty),
      formatAmount(o.total),
      o.cashTendered !== undefined ? formatAmount(o.cashTendered) : '',
      o.change !== undefined ? formatAmount(o.change) : '',
    ])
  })
  return [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')
}

const csvCell = (v: string | number) => {
  const s = String(v)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function downloadCsv(csv: string, filename: string) {
  // BOM so Excel reads it as UTF-8 (Arabic item names later).
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const csvFilename = (label: string) =>
  `${config.cafeName.toLowerCase().replace(/\s+/g, '-')}-sales-${label}.csv`
