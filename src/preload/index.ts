import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getCategories: () => electronAPI.ipcRenderer.invoke('db:getCategories'),
  getEntries: (startDate?: string, endDate?: string) =>
    electronAPI.ipcRenderer.invoke('db:getEntries', startDate, endDate),
  addEntry: (categoryId: number, duration: number, date: string, notes: string, source?: string, createdAt?: string) =>
    electronAPI.ipcRenderer.invoke('db:addEntry', categoryId, duration, date, notes, source, createdAt),
  getSummary: () => electronAPI.ipcRenderer.invoke('db:getSummary'),
  getSummaryByRange: (startDate: string, endDate?: string) =>
    electronAPI.ipcRenderer.invoke('db:getSummaryByRange', startDate, endDate),
  deleteEntry: (id: number) => electronAPI.ipcRenderer.invoke('db:deleteEntry', id),
  updateEntry: (id: number, categoryId: number, duration: number, date: string, notes: string) =>
    electronAPI.ipcRenderer.invoke('db:updateEntry', id, categoryId, duration, date, notes),
  saveActiveTimer: (categoryId: number, startTime: string, notes: string) =>
    electronAPI.ipcRenderer.invoke('db:saveActiveTimer', categoryId, startTime, notes),
  getActiveTimer: () => electronAPI.ipcRenderer.invoke('db:getActiveTimer'),
  clearActiveTimer: () => electronAPI.ipcRenderer.invoke('db:clearActiveTimer'),
  addCategory: (name: string, color: string, parentId?: number | null) => electronAPI.ipcRenderer.invoke('db:addCategory', name, color, parentId),
  updateCategory: (id: number, name: string, color: string, weeklyTarget: number, dailyTarget: number, parentId?: number | null) => electronAPI.ipcRenderer.invoke('db:updateCategory', id, name, color, weeklyTarget, dailyTarget, parentId),
  deleteCategory: (id: number) => electronAPI.ipcRenderer.invoke('db:deleteCategory', id),
  importEntries: (entries: any[]) => electronAPI.ipcRenderer.invoke('db:importEntries', entries),
  importRawData: (rawData: string) => electronAPI.ipcRenderer.invoke('db:importRawData', rawData),
  saveFile: (content: string, defaultPath: string) => electronAPI.ipcRenderer.invoke('dialog:saveFile', content, defaultPath),
  openFile: () => electronAPI.ipcRenderer.invoke('dialog:openFile'),
  readFile: (filePath: string) => electronAPI.ipcRenderer.invoke('file:read', filePath)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in d.ts)
  window.electron = electronAPI
  // @ts-ignore (define in d.ts)
  window.api = api
}
