import type { Recipe } from '@/types/recipe'

interface RecipeCardProps {
  recipe: Recipe
  onClick: () => void
}

export default function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const preview = recipe.ingredients.slice(0, 4).join(' · ')

  return (
    <article
      className="bg-white rounded-[16px] p-[18px] cursor-pointer transition-all duration-300 border border-brown/5 relative overflow-hidden animate-fade-in-up hover:-translate-y-[3px] hover:shadow-lg active:-translate-y-[1px] group"
      style={{ boxShadow: '0 2px 8px rgba(61, 43, 31, 0.08)' }}
      onClick={onClick}
    >
      {/* Right border accent on hover */}
      <div className="absolute top-0 right-0 w-1 h-full bg-terracotta opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {recipe.instructions && (
        <span className="absolute top-3 left-3 w-2 h-2 rounded-full bg-sage" title="יש הוראות הכנה" />
      )}

      <div className="flex justify-between items-start mb-2.5">
        <h3 className="font-suez text-[1.05rem] text-brown leading-[1.4] flex-1">{recipe.name}</h3>
      </div>

      <div className="flex gap-2.5 flex-wrap">
        {recipe.temp && (
          <span className="inline-flex items-center gap-1 text-[0.72rem] text-brown-light bg-cream px-2 py-0.5 rounded-[6px]">
            <span className="text-[0.8rem]">🌡️</span>{recipe.temp}°
          </span>
        )}
        {recipe.time && (
          <span className="inline-flex items-center gap-1 text-[0.72rem] text-brown-light bg-cream px-2 py-0.5 rounded-[6px]">
            <span className="text-[0.8rem]">⏱️</span>{recipe.time}
          </span>
        )}
        {recipe.source && (
          <span className="inline-flex items-center gap-1 text-[0.72rem] text-brown-light bg-cream px-2 py-0.5 rounded-[6px]">
            <span className="text-[0.8rem]">👩‍🍳</span>{recipe.source}
          </span>
        )}
      </div>

      <p className="text-[0.78rem] text-brown-light/70 leading-[1.5] mt-2 line-clamp-2">{preview}</p>
    </article>
  )
}
