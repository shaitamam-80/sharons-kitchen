import type { Category, CategoryId, Recipe } from '@/types/recipe'

interface CategoryBarProps {
  categories: Category[]
  activeCategory: CategoryId
  recipes: Recipe[]
  onSelect: (id: CategoryId) => void
}

export default function CategoryBar({ categories, activeCategory, recipes, onSelect }: CategoryBarProps) {
  return (
    <nav
      className="sticky top-0 z-40 overflow-x-auto hide-scrollbar"
      style={{
        background: 'linear-gradient(to bottom, var(--color-cream) 0%, var(--color-cream) 85%, transparent 100%)',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="flex gap-2 px-5 py-3.5 max-w-[900px] mx-auto">
        {categories.map(cat => {
          const count = cat.id !== 'all' ? recipes.filter(r => r.category === cat.id).length : 0
          const isActive = activeCategory === cat.id

          return (
            <button
              key={cat.id}
              className="shrink-0 cursor-pointer transition-all duration-250 active:scale-95 border-none outline-none"
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.82rem',
                fontWeight: isActive ? 600 : 500,
                whiteSpace: 'nowrap',
                background: isActive
                  ? 'var(--color-terracotta)'
                  : 'var(--color-cream-dark)',
                color: isActive
                  ? '#FAF9F6'
                  : 'var(--color-brown-light)',
                boxShadow: isActive
                  ? '0 2px 10px rgba(43, 122, 120, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)'
                  : '0 1px 2px rgba(23, 37, 42, 0.04)',
              }}
              onClick={() => onSelect(cat.id)}
            >
              <span className="ml-1">{cat.emoji}</span>
              {cat.name}
              {cat.id !== 'all' && (
                <span
                  className="mr-1.5"
                  style={{
                    opacity: isActive ? 0.75 : 0.5,
                    fontSize: '0.75rem',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
