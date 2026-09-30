import { config } from '../../config'

// All money is stored as integers in the currency's minor unit (baisa for
// OMR, 1000 per rial). Never store floats like 1.1: 0.1 + 0.2 !== 0.3 and
// end-of-day totals drift.

export type Minor = number

const formatter = new Intl.NumberFormat(config.locale, {
  style: 'currency',
  currency: config.currency,
})

export const formatMoney = (amount: Minor) => formatter.format(amount / config.minorPerMajor)

// Just the number, no currency code: "1.100". Handy on busy item cards.
export const formatAmount = (amount: Minor) =>
  (amount / config.minorPerMajor).toFixed(Math.log10(config.minorPerMajor))

// Prices are VAT-inclusive, so VAT is gross minus gross / (1 + rate).
export const vatFromGross = (gross: Minor, rate: number = config.vatRate): Minor =>
  rate > 0 ? Math.round(gross - gross / (1 + rate)) : 0

const DECIMALS = Math.round(Math.log10(config.minorPerMajor))

// Parses what a cashier typed ("5", "5.5", "5.250") into minor units without
// going through floats. Returns null for anything that isn't a valid amount.
export function parseAmount(input: string): Minor | null {
  const m = /^(\d{0,6})(?:\.(\d{0,3}))?$/.exec(input.trim())
  if (!m || (m[1] === '' && !m[2])) return null
  const whole = Number(m[1] || '0')
  const frac = Number((m[2] ?? '').padEnd(DECIMALS, '0').slice(0, DECIMALS) || '0')
  return whole * config.minorPerMajor + frac
}

// Omani notes, in baisa. Used for the quick "customer gave…" buttons.
export const CASH_NOTES: Minor[] = [500, 1000, 5000, 10000, 20000, 50000]
