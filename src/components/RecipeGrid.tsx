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
      <div className="text-center py-15 px-5">
        <div className="text-[3rem] mb-3">🔍</div>
        <p className="text-gold text-[0.95rem]">
          לא נמצאו מתכונים{search ? ` עבור "${search}"` : ''}
        </p>
      </div>
    )
  }

  // Show grouped view when showing "all" without search
  if (activeCategory === 'all' && !search) {
    return (
      <>
        {categoryOrder
          .filter(catId => groupedRecipes[catId])
          .map(catId => {
            const cat = categories.find(c => c.id === catId)!
            const items = groupedRecipes[catId]!
            return (
              <section key={catId} className="mb-8">
                <h2 className="font-suez text-[1.3rem] text-terracotta-dark mb-3.5 pb-2 border-b-2 border-gold-light flex items-center gap-2">
                  <span className="text-[1.4rem]">{cat.emoji}</span>
                  {cat.name}
                  <span className="font-heebo text-[0.7rem] font-medium text-gold bg-cream-dark px-2 py-0.5 rounded-[10px] mr-auto">
                    {items.length}
                  </span>
                </h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
                  {items.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} onClick={() => onOpenRecipe(recipe.id)} />
                  ))}
                </div>
              </section>
            )
          })}
      </>
    )
  }

  // Flat view for filtered/category view
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
      {filteredRecipes.map(recipe => (
        <RecipeCard key={recipe.id} recipe={recipe} onClick={() => onOpenRecipe(recipe.id)} />
      ))}
    </div>
  )
}
