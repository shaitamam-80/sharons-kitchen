import { useState, useCallback, useMemo } from 'react'
import { recipes as defaultRecipes, categories } from '@/data/recipes'
import { useLocalStorage } from './useLocalStorage'
import type { Recipe, CategoryId } from '@/types/recipe'

const STORAGE_KEY = 'sharons-kitchen-data'
const LEGACY_KEY = 'sharons-kitchen-data' // same key, compatible format

interface RecipeOverrides {
  [id: number]: { instructions?: string; notes?: string; ingredients?: string[] }
}

function migrateLegacyData(): RecipeOverrides {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as RecipeOverrides
  } catch {
    return {}
  }
}

export function useRecipeStore() {
  const [overrides, setOverrides] = useLocalStorage<RecipeOverrides>(STORAGE_KEY, migrateLegacyData())
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all')
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null)

  // Merge default recipes with localStorage overrides
  const recipes: Recipe[] = useMemo(() =>
    defaultRecipes.map(r => ({
      ...r,
      instructions: overrides[r.id]?.instructions ?? r.instructions,
      notes: overrides[r.id]?.notes ?? r.notes,
      ingredients: overrides[r.id]?.ingredients ?? r.ingredients,
    })),
    [overrides]
  )

  const filteredRecipes = useMemo(() => {
    let result = recipes

    if (activeCategory !== 'all') {
      result = result.filter(r => r.category === activeCategory)
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase()
      result = result.filter(r =>
        r.name.toLowerCase().includes(term) ||
        r.ingredients.some(i => i.toLowerCase().includes(term)) ||
        (r.source && r.source.toLowerCase().includes(term)) ||
        (r.notes && r.notes.toLowerCase().includes(term))
      )
    }

    return result
  }, [recipes, activeCategory, search])

  const groupedRecipes = useMemo(() => {
    const groups: Partial<Record<CategoryId, Recipe[]>> = {}
    filteredRecipes.forEach(r => {
      if (!groups[r.category]) groups[r.category] = []
      groups[r.category]!.push(r)
    })
    return groups
  }, [filteredRecipes])

  const selectedRecipe = useMemo(
    () => selectedRecipeId !== null ? recipes.find(r => r.id === selectedRecipeId) ?? null : null,
    [selectedRecipeId, recipes]
  )

  const saveInstructions = useCallback((recipeId: number, instructions: string) => {
    setOverrides(prev => ({
      ...prev,
      [recipeId]: { ...prev[recipeId], instructions },
    }))
  }, [setOverrides])

  const saveNotes = useCallback((recipeId: number, notes: string) => {
    setOverrides(prev => ({
      ...prev,
      [recipeId]: { ...prev[recipeId], notes },
    }))
  }, [setOverrides])

  const saveIngredients = useCallback((recipeId: number, ingredients: string[]) => {
    setOverrides(prev => ({
      ...prev,
      [recipeId]: { ...prev[recipeId], ingredients },
    }))
  }, [setOverrides])

  const changesCount = useMemo(() => Object.keys(overrides).length, [overrides])

  const exportChanges = useCallback(async (): Promise<{ count: number; error?: string }> => {
    const changes = Object.entries(overrides).map(([idStr, override]) => {
      const id = Number(idStr)
      const recipe = defaultRecipes.find(r => r.id === id)
      return {
        id,
        name: recipe?.name ?? `מתכון ${id}`,
        ...(override.instructions !== undefined ? { instructions: override.instructions } : {}),
        ...(override.notes !== undefined ? { notes: override.notes } : {}),
        ...(override.ingredients !== undefined ? { ingredients: override.ingredients } : {}),
      }
    })

    const exportData = {
      exportedAt: new Date().toISOString(),
      device: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
      changesCount: changes.length,
      changes,
    }

    const json = JSON.stringify(exportData, null, 2)

    // Strategy 1: Web Share API with file
    try {
      const blob = new Blob([json], { type: 'application/json' })
      const file = new File([blob], `sharon-changes-${Date.now()}.json`, { type: 'application/json' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'שינויים במתכונים' })
        return { count: changes.length }
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        return { count: 0, error: 'cancelled' }
      }
      // Fall through to next strategy
    }

    // Strategy 2: Web Share API with text (works in more PWA contexts)
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'שינויים במתכונים - המטבח של שרון',
          text: json,
        })
        return { count: changes.length }
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        return { count: 0, error: 'cancelled' }
      }
      // Fall through to next strategy
    }

    // Strategy 3: Copy to clipboard
    try {
      await navigator.clipboard.writeText(json)
      return { count: changes.length, error: 'clipboard' }
    } catch {
      // Fall through to download
    }

    // Strategy 4: Download file
    try {
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sharon-changes-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return { count: changes.length }
    } catch {
      return { count: 0, error: 'failed' }
    }
  }, [overrides])

  const openRecipe = useCallback((id: number) => setSelectedRecipeId(id), [])
  const closeRecipe = useCallback(() => setSelectedRecipeId(null), [])

  return {
    // Data
    recipes,
    categories,
    filteredRecipes,
    groupedRecipes,
    selectedRecipe,
    // State
    search,
    activeCategory,
    // Actions
    setSearch,
    setActiveCategory,
    openRecipe,
    closeRecipe,
    saveInstructions,
    saveNotes,
    saveIngredients,
    exportChanges,
    changesCount,
  }
}
