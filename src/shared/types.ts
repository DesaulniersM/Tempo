export interface Category {
  id: number
  name: string
  color: string
  weekly_target: number
  daily_target: number
  parent_id: number | null
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
  timezone: string | null
  created_at: string
}

export interface Summary {
  id: number
  name: string
  color: string
  weekly_target: number
  daily_target: number
  parent_id: number | null
  total_duration: number
}
