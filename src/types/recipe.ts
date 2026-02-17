export interface Recipe {
  id: number
  name: string
  source?: string
  category: CategoryId
  ingredients: string[]
  temp: string
  time: string
  instructions: string
  notes: string
}

export type CategoryId = 'all' | 'cookies' | 'cakes' | 'breads' | 'doughs' | 'creams' | 'misc'

export interface Category {
  id: CategoryId
  name: string
  emoji: string
}
