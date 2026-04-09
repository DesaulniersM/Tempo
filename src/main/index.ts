import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import {
  initDb,
  getCategories,
  getEntries,
  addEntry,
  getSummary,
  getSummaryByRange,
  deleteEntry,
  updateEntry,
  saveActiveTimer,
  getActiveTimer,
  clearActiveTimer,
  addCategory,
  updateCategory,
  deleteCategory,
  importEntries,
  importRawData
} from './db'

async function createWindow(): Promise<void> {
  // Initialize database
  await initDb()

  // File System Handlers
  ipcMain.handle('dialog:saveFile', async (_, content, defaultPath) => {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Export Data',
      defaultPath: defaultPath,
      filters: [
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'JSON Files', extensions: ['json'] }
      ]
    })
    if (filePath) {
      fs.writeFileSync(filePath, content)
      return true
    }
    return false
  })

  ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    })
    if (canceled) return null
    return filePaths[0]
  })

  ipcMain.handle('file:read', (_, filePath) => {
    try {
      return fs.readFileSync(filePath, 'utf-8')
    } catch (err) {
      console.error('Failed to read file:', err)
      return null
    }
  })

  // Register Database IPC handlers
  ipcMain.handle('db:getCategories', () => getCategories())
  ipcMain.handle('db:getEntries', (_, startDate, endDate) => getEntries(startDate, endDate))
  ipcMain.handle('db:addEntry', (_, categoryId, duration, date, notes, source) =>
    addEntry(categoryId, duration, date, notes, source)
  )
  ipcMain.handle('db:importEntries', (_, entries) => importEntries(entries))
  ipcMain.handle('db:importRawData', (_, rawData) => importRawData(rawData))
  ipcMain.handle('db:getSummary', () => getSummary())
  ipcMain.handle('db:getSummaryByRange', (_, startDate, endDate) => getSummaryByRange(startDate, endDate))
  ipcMain.handle('db:deleteEntry', (_, id) => deleteEntry(id))
  ipcMain.handle('db:updateEntry', (_, id, categoryId, duration, date, notes) =>
    updateEntry(id, categoryId, duration, date, notes)
  )
  ipcMain.handle('db:saveActiveTimer', (_, categoryId, startTime, notes) =>
    saveActiveTimer(categoryId, startTime, notes)
  )
  ipcMain.handle('db:getActiveTimer', () => getActiveTimer())
  ipcMain.handle('db:clearActiveTimer', () => clearActiveTimer())
  ipcMain.handle('db:addCategory', (_, name, color) => addCategory(name, color))
  ipcMain.handle('db:updateCategory', (_, id, name, color, weeklyTarget, dailyTarget) => updateCategory(id, name, color, weeklyTarget, dailyTarget))
  ipcMain.handle('db:deleteCategory', (_, id) => deleteCategory(id))

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
