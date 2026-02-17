import type { Recipe } from '@/types/recipe'

interface RecipeCardProps {
  recipe: Recipe
  onClick: () => void
  staggerIndex?: number
}

export default function RecipeCard({ recipe, onClick, staggerIndex = 0 }: RecipeCardProps) {
  const preview = recipe.ingredients.slice(0, 3).join(' · ')
  const hasContent = !!(recipe.instructions || recipe.notes)
  const staggerClass = staggerIndex <= 6 ? `stagger-${staggerIndex}` : ''

  return (
    <article
      className={`relative cursor-pointer transition-all duration-300 group opacity-0 animate-fade-in-up hover:-translate-y-0.5 active:scale-[0.98] ${staggerClass}`}
      style={{
        background: '#FFFFFF',
        borderRadius: '14px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(23,37,42,0.05), 0 4px 12px rgba(23,37,42,0.03)',
        border: '1px solid rgba(23, 37, 42, 0.05)',
      }}
      onClick={onClick}
    >
      {/* Top accent on hover */}
      <div
        className="absolute top-0 right-4 left-4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(90deg, var(--color-terracotta), var(--color-sage))' }}
      />

      {hasContent && (
        <span
          className="absolute top-4 left-4 w-[7px] h-[7px] rounded-full"
          style={{ background: 'var(--color-terracotta)', boxShadow: '0 0 0 2px rgba(43,122,120,0.15)' }}
          title="יש הוראות הכנה"
        />
      )}

      <h3
        className="leading-snug mb-2"
        style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--color-brown)' }}
      >
        {recipe.name}
      </h3>

      {(recipe.temp || recipe.time || recipe.source) && (
        <div className="flex gap-2 flex-wrap mb-2.5">
          {recipe.temp && (
            <span className="inline-flex items-center gap-1 text-[0.72rem] px-2 py-[3px] rounded-md" style={{ color: 'var(--color-brown-medium)', background: 'var(--color-cream-dark)' }}>
              🌡️ {recipe.temp}°
            </span>
          )}
          {recipe.time && (
            <span className="inline-flex items-center gap-1 text-[0.72rem] px-2 py-[3px] rounded-md" style={{ color: 'var(--color-brown-medium)', background: 'var(--color-cream-dark)' }}>
              ⏱️ {recipe.time}
            </span>
          )}
          {recipe.source && (
            <span className="inline-flex items-center gap-1 text-[0.72rem] px-2 py-[3px] rounded-md" style={{ color: 'var(--color-brown-medium)', background: 'var(--color-cream-dark)' }}>
              👩‍🍳 {recipe.source}
            </span>
          )}
        </div>
      )}

      <p
        className="line-clamp-2 leading-relaxed"
        style={{ fontSize: '0.8rem', color: 'var(--color-brown-medium)', opacity: 0.65, fontFamily: 'var(--font-body)' }}
      >
        {preview}
      </p>
    </article>
  )
}
