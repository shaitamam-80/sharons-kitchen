import type { Recipe, CategoryId } from '@/types/recipe'
import type { Category } from '@/types/recipe'
import RecipeCard from './RecipeCard'

interface RecipeGridProps {
  filteredRecipes: Recipe[]
  groupedRecipes: Partial<Record<CategoryId, Recipe[]>>
  categories: Category[]
  activeCategory: CategoryId
  search: string
  onOpenRecipe: (id: number) => void
}

const categoryOrder: CategoryId[] = ['cookies', 'cakes', 'breads', 'doughs', 'creams', 'misc']

export default function RecipeGrid({ filteredRecipes, groupedRecipes, categories, activeCategory, search, onOpenRecipe }: RecipeGridProps) {
  if (filteredRecipes.length === 0) {
    return (
      <div className="text-center py-20 px-5">
        <div className="text-[3rem] mb-4">🔍</div>
        <p style={{ color: 'var(--color-brown-medium)', fontSize: '1rem', fontFamily: 'var(--font-body)' }}>
          לא נמצאו מתכונים{search ? ` עבור "${search}"` : ''}
        </p>
      </div>
    )
  }

  if (activeCategory === 'all' && !search) {
    return (
      <>
        {categoryOrder
          .filter(catId => groupedRecipes[catId])
          .map(catId => {
            const cat = categories.find(c => c.id === catId)!
            const items = groupedRecipes[catId]!
            return (
              <section key={catId} className="mb-10">
                <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '2px solid var(--color-cream-dark)' }}>
                  <span className="text-[1.3rem]">{cat.emoji}</span>
                  <h2
                    className="font-suez text-[1.25rem]"
                    style={{ color: 'var(--color-terracotta-dark)' }}
                  >
                    {cat.name}
                  </h2>
                  <span
                    className="font-heebo text-[0.7rem] font-medium px-2.5 py-0.5 rounded-full mr-auto"
                    style={{ background: 'var(--color-cream-dark)', color: 'var(--color-brown-medium)' }}
                  >
                    {items.length}
                  </span>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
                  {items.map((recipe, i) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onClick={() => onOpenRecipe(recipe.id)}
                      staggerIndex={i % 7}
                    />
                  ))}
                </div>
              </section>
            )
          })}
      </>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
      {filteredRecipes.map((recipe, i) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onClick={() => onOpenRecipe(recipe.id)}
          staggerIndex={i % 7}
        />
      ))}
    </div>
  )
}
