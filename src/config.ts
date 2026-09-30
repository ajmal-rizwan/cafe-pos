// App-wide settings. Values can be overridden per device with a .env file.

export const config = {
  cafeName: import.meta.env.VITE_CAFE_NAME ?? 'Sugarpepper',
  tillId: import.meta.env.VITE_TILL_ID ?? 'till-1',
  tillLabel: import.meta.env.VITE_TILL_LABEL ?? 'Till 1',

  // Omani rial: 1 OMR = 1000 baisa, shown with 3 decimals (1.100).
  currency: 'OMR',
  locale: 'en-OM',
  minorPerMajor: 1000,

  // 0 hides the VAT line. Oman's standard rate is 5% if it's needed later.
  vatRate: 0,
} as const
