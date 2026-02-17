import type { Category, CategoryId, Recipe } from '@/types/recipe'

interface CategoryBarProps {
  categories: Category[]
  activeCategory: CategoryId
  recipes: Recipe[]
  onSelect: (id: CategoryId) => void
}

export default function CategoryBar({ categories, activeCategory, recipes, onSelect }: CategoryBarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-cream border-b border-brown/[0.06] overflow-x-auto hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="flex gap-2 px-5 py-3 max-w-[900px] mx-auto">
        {categories.map(cat => {
          const count = cat.id !== 'all' ? recipes.filter(r => r.category === cat.id).length : 0
          return (
            <button
              key={cat.id}
              className={`shrink-0 px-4 py-2 rounded-[24px] font-heebo text-[0.82rem] font-medium whitespace-nowrap cursor-pointer transition-all duration-250
                ${activeCategory === cat.id
                  ? 'bg-terracotta text-white border-terracotta shadow-[0_2px_8px_rgba(199,91,57,0.25)]'
                  : 'bg-white text-brown-light border-brown/10 hover:border-terracotta-light hover:text-terracotta'
                }`}
              style={{ borderWidth: '1.5px', borderStyle: 'solid' }}
              onClick={() => onSelect(cat.id)}
            >
              {cat.emoji} {cat.name}
              {cat.id !== 'all' && (
                <span className="opacity-70 mr-0.5">({count})</span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
