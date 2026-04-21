import { ElectronAPI } from '@electron-toolkit/preload'
import { Category, Entry, Summary } from '../shared/types'

export interface ActiveTimer {
  category_id: number
  start_time: string
  notes: string
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getCategories: () => Promise<Category[]>
      getEntries: (startDate?: string, endDate?: string) => Promise<Entry[]>
      addEntry: (
        categoryId: number,
        duration: number,
        date: string,
        notes: string,
        source?: string,
        createdAt?: string
      ) => Promise<void>
      getSummary: () => Promise<Summary[]>
      getSummaryByRange: (startDate: string, endDate?: string) => Promise<Summary[]>
      deleteEntry: (id: number) => Promise<void>
      updateEntry: (
        id: number,
        categoryId: number,
        duration: number,
        date: string,
        notes: string
      ) => Promise<void>
      saveActiveTimer: (categoryId: number, startTime: string, notes: string) => Promise<void>
      getActiveTimer: () => Promise<ActiveTimer | null>
      clearActiveTimer: () => Promise<void>
      addCategory: (name: string, color: string, parentId?: number | null) => Promise<void>
      updateCategory: (id: number, name: string, color: string, weeklyTarget: number, dailyTarget: number, parentId?: number | null) => Promise<void>
      deleteCategory: (id: number) => Promise<void>
      importEntries: (entries: any[]) => Promise<void>
      importRawData: (rawData: string) => Promise<{ success: boolean, count?: number, message?: string }>
      saveFile: (content: string, defaultPath: string) => Promise<boolean>
      openFile: () => Promise<string | null>
      readFile: (filePath: string) => Promise<string | null>
    }
  }
}
