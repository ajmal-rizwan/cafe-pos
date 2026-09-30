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
