import { useState, useCallback, useMemo } from 'react'
import { recipes as defaultRecipes, categories } from '@/data/recipes'
import { useLocalStorage } from './useLocalStorage'
import type { Recipe, CategoryId } from '@/types/recipe'

const STORAGE_KEY = 'sharons-kitchen-data'
const LEGACY_KEY = 'sharons-kitchen-data' // same key, compatible format

interface RecipeOverrides {
  [id: number]: { instructions?: string; notes?: string }
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
  }
}
