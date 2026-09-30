import { db } from './db'
import { MENU } from './menu'
import type { Category, Product, ProductSize } from './types'

const DEFAULT_LABELS: Record<number, string[]> = {
  2: ['M', 'L'],
  3: ['S', 'M', 'L'],
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Turns the menu rows in menu.ts into category and product records.
export function buildMenu(): { categories: Category[]; products: Product[] } {
  const categories: Category[] = []
  const products: Product[] = []

  MENU.forEach((section, sectionIndex) => {
    categories.push({ id: section.id, name: section.name, sort: sectionIndex })

    section.rows.forEach(([code, name, ...rest], rowIndex) => {
      const prices = rest.filter((x): x is number => typeof x === 'number')
      const rowLabels = rest.find((x): x is string[] => Array.isArray(x))
      const labels =
        prices.length === 1 ? [''] : (rowLabels ?? section.sizes ?? DEFAULT_LABELS[prices.length])

      if (!labels || labels.length < prices.length) {
        throw new Error(`Menu item "${name}": no size labels for ${prices.length} prices`)
      }

      const sizes: ProductSize[] = prices.map((price, i) => ({ label: labels[i], price }))

      products.push({
        // Stable ids: printed code when there is one, else the section + name.
        id: code !== null ? `p${code}` : `${section.id}-${slug(name)}`,
        ...(code !== null && { code }),
        categoryId: section.id,
        name,
        sizes,
        sort: rowIndex,
        active: true,
      })
    })
  })

  return { categories, products }
}

// menu.ts is the source of truth for now, so the stored menu is replaced
// on every start. Orders are never touched. Once there's a back-office menu
// editor, switch this to seed-once.
export async function syncMenu() {
  const { categories, products } = buildMenu()
  await db.transaction('rw', db.categories, db.products, async () => {
    await db.categories.clear()
    await db.products.clear()
    await db.categories.bulkAdd(categories)
    await db.products.bulkAdd(products)
  })
}
