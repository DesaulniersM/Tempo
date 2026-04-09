export interface Category {
  id: number
  name: string
  color: string
  weekly_target: number
  daily_target: number
}

export interface Entry {
  id: number
  category_id: number
  category_name: string
  category_color: string
  duration: number
  date: string
  notes: string
  source: 'timer' | 'manual' | 'import'
  created_at: string
}

export interface Summary {
  name: string
  color: string
  weekly_target: number
  daily_target: number
  total_duration: number
}
