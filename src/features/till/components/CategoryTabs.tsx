import type { Category } from '../../../db/types'
import './CategoryTabs.css'

interface Props {
  categories: Category[]
  activeId: string | null
  onSelect: (id: string) => void
}

export function CategoryTabs({ categories, activeId, onSelect }: Props) {
  return (
    <nav className="cats" aria-label="Menu categories">
      {categories.map((c) => (
        <button
          key={c.id}
          className={c.id === activeId ? 'cat cat--active' : 'cat'}
          aria-pressed={c.id === activeId}
          onClick={() => onSelect(c.id)}
        >
          {c.name}
        </button>
      ))}
    </nav>
  )
}
