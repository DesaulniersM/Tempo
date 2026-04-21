const Database = require('better-sqlite3')
import { app } from 'electron'
import { join } from 'path'
import fs from 'fs'

let db: any

export function initDb() {
  if (!db) {
    const userDataPath = app.getPath('userData')
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true })
    }
    const dbPath = join(userDataPath, 'scholar-track.sqlite')
    try {
      db = new Database(dbPath)

      db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          color TEXT NOT NULL,
          weekly_target REAL DEFAULT 0,
          daily_target REAL DEFAULT 0,
          parent_id INTEGER,
          FOREIGN KEY (parent_id) REFERENCES categories (id)
        )
      `)

      // Migration checks
      const catInfo = db.prepare("PRAGMA table_info(categories)").all()
      if (!catInfo.some((col: any) => col.name === 'weekly_target')) db.exec("ALTER TABLE categories ADD COLUMN weekly_target REAL DEFAULT 0")
      if (!catInfo.some((col: any) => col.name === 'daily_target')) db.exec("ALTER TABLE categories ADD COLUMN daily_target REAL DEFAULT 0")
      if (!catInfo.some((col: any) => col.name === 'parent_id')) db.exec("ALTER TABLE categories ADD COLUMN parent_id INTEGER")

      db.exec(`
        CREATE TABLE IF NOT EXISTS entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_id INTEGER NOT NULL,
          duration REAL NOT NULL,
          date TEXT NOT NULL,
          notes TEXT,
          source TEXT DEFAULT 'manual',
          timezone TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories (id)
        )
      `)

      const entryInfo = db.prepare("PRAGMA table_info(entries)").all()
      if (!entryInfo.some((col: any) => col.name === 'source')) {
        db.exec("ALTER TABLE entries ADD COLUMN source TEXT DEFAULT 'manual'")
        db.exec("UPDATE entries SET source = 'import' WHERE notes LIKE 'Imported%'")
      }
      if (!entryInfo.some((col: any) => col.name === 'timezone')) {
        db.exec("ALTER TABLE entries ADD COLUMN timezone TEXT")
      }

      db.exec(`
        CREATE TABLE IF NOT EXISTS active_timer (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          category_id INTEGER NOT NULL,
          start_time TEXT NOT NULL,
          notes TEXT,
          FOREIGN KEY (category_id) REFERENCES categories (id)
        )
      `)

      const countStmt = db.prepare('SELECT COUNT(*) as count FROM categories')
      const result = countStmt.get() as { count: number }
      if (result.count === 0) {
        const defaults = [
          { name: 'Research', color: '#3b82f6' },
          { name: 'TA', color: '#10b981' },
          { name: 'Homework', color: '#f59e0b' },
          { name: 'Classes & meetings', color: '#8b5cf6' },
          { name: 'NREL', color: '#ef4444' }
        ]
        const insert = db.prepare('INSERT INTO categories (name, color) VALUES (?, ?)')
        for (const cat of defaults) insert.run(cat.name, cat.color)
      }
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw error
    }
  }
}

export function getCategories() { return db.prepare('SELECT * FROM categories').all() }
export function addCategory(name: string, color: string, parentId: number | null = null) { 
  return db.prepare('INSERT OR IGNORE INTO categories (name, color, parent_id) VALUES (?, ?, ?)').run(name, color, parentId) 
}

export function importEntries(entries: { category_id: number, duration: number, date: string, notes: string, source?: string }[]) {
  const insert = db.prepare('INSERT INTO entries (category_id, duration, date, notes, source) VALUES (?, ?, ?, ?, ?)')
  const transaction = db.transaction((data) => {
    for (const entry of data) {
      insert.run(entry.category_id, entry.duration, entry.date, entry.notes, entry.source || 'import')
    }
  })
  return transaction(entries)
}

export function importRawData(rawData: string) {
  const rows = rawData.trim().split('\n')
  if (rows.length < 2) return { success: false, message: 'No data found' }
  const firstRow = rows[0]
  const delimiter = firstRow.includes('\t') ? '\t' : ','
  const headers = firstRow.split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''))
  const ignoredColumns = ['date', 'total', 'weekly total', 'average per day', 'notes', 'cumulative total', 'total days off']
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4']
  const transaction = db.transaction(() => {
    const categoryMap: Record<number, number> = {}
    for (let j = 1; j < headers.length; j++) {
      const header = headers[j]
      if (!header || ignoredColumns.includes(header.toLowerCase())) continue
      db.prepare('INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)').run(header, colors[j % colors.length])
      const cat = db.prepare('SELECT id FROM categories WHERE name = ?').get(header) as { id: number }
      categoryMap[j] = cat.id
    }
    let count = 0
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''))
      const dateStr = cols[0]
      if (!dateStr) continue
      let formattedDate = ''
      const parts = dateStr.split(/[-/]/)
      if (parts.length === 3) {
        const m = parts[0].padStart(2, '0'); const d = parts[1].padStart(2, '0'); let y = parts[2]
        if (y.length === 2) y = `20${y}`
        if (parseInt(m) <= 12) formattedDate = `${y}-${m}-${d}`
      }
      if (!formattedDate) continue
      for (const [headerIndex, catId] of Object.entries(categoryMap)) {
        const duration = parseFloat(cols[parseInt(headerIndex)])
        if (!isNaN(duration) && duration > 0) {
          db.prepare('INSERT INTO entries (category_id, duration, date, notes, source) VALUES (?, ?, ?, ?, ?)').run(
            catId, duration, formattedDate, 'Imported History', 'import'
          )
          count++
        }
      }
    }
    return count
  })
  const importedCount = transaction()
  return { success: true, count: importedCount }
}

export function updateCategory(id: number, name: string, color: string, weeklyTarget: number, dailyTarget: number, parentId: number | null = null) {
  return db.prepare('UPDATE categories SET name = ?, color = ?, weekly_target = ?, daily_target = ?, parent_id = ? WHERE id = ?').run(
    name, color, weeklyTarget, dailyTarget, parentId, id
  )
}

export function deleteCategory(id: number) {
  const entriesCount = db.prepare('SELECT COUNT(*) as count FROM entries WHERE category_id = ?').get(id) as { count: number }
  if (entriesCount.count > 0) throw new Error('Cannot delete category with entries')
  db.prepare('DELETE FROM active_timer WHERE category_id = ?').run(id)
  return db.prepare('DELETE FROM categories WHERE id = ?').run(id)
}

export function getEntries(startDate?: string, endDate?: string) {
  const base = 'SELECT e.*, c.name as category_name, c.color as category_color, c.parent_id FROM entries e JOIN categories c ON e.category_id = c.id'
  if (startDate && endDate) return db.prepare(`${base} WHERE date BETWEEN ? AND ? ORDER BY date DESC, e.id DESC`).all(startDate, endDate)
  if (startDate) return db.prepare(`${base} WHERE date >= ? ORDER BY date DESC, e.id DESC`).all(startDate)
  return db.prepare(`${base} ORDER BY date DESC, e.id DESC`).all()
}

export function addEntry(categoryId: number, duration: number, date: string, notes: string, source: string = 'manual', createdAt?: string, timezone?: string) {
  const ts = createdAt || new Date().toISOString()
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  return db.prepare('INSERT INTO entries (category_id, duration, date, notes, source, created_at, timezone) VALUES (?, ?, ?, ?, ?, ?, ?)').run(categoryId, duration, date, notes, source, ts, tz)
}

export function deleteEntry(id: number) { return db.prepare('DELETE FROM entries WHERE id = ?').run(id) }
export function updateEntry(id: number, categoryId: number, duration: number, date: string, notes: string) { return db.prepare('UPDATE entries SET category_id = ?, duration = ?, date = ?, notes = ? WHERE id = ?').run(categoryId, duration, date, notes, id) }

export function getSummary() { 
  return db.prepare('SELECT c.id, c.name, c.color, c.weekly_target, c.daily_target, c.parent_id, IFNULL(SUM(e.duration), 0) as total_duration FROM categories c LEFT JOIN entries e ON c.id = e.category_id GROUP BY c.id').all() 
}

export function getSummaryByRange(startDate: string, endDate?: string) {
  const query = endDate 
    ? `SELECT c.id, c.name, c.color, c.weekly_target, c.daily_target, c.parent_id, IFNULL(SUM(e.duration), 0) as total_duration FROM categories c LEFT JOIN entries e ON c.id = e.category_id AND e.date BETWEEN ? AND ? GROUP BY c.id`
    : `SELECT c.id, c.name, c.color, c.weekly_target, c.daily_target, c.parent_id, IFNULL(SUM(e.duration), 0) as total_duration FROM categories c LEFT JOIN entries e ON c.id = e.category_id AND e.date >= ? GROUP BY c.id`
  return db.prepare(query).all(endDate ? [startDate, endDate] : [startDate])
}

export function saveActiveTimer(categoryId: number, startTime: string, notes: string) { return db.prepare('INSERT OR REPLACE INTO active_timer (id, category_id, start_time, notes) VALUES (1, ?, ?, ?)').run(categoryId, startTime, notes) }
export function getActiveTimer() { return db.prepare('SELECT * FROM active_timer WHERE id = 1').get() }
export function clearActiveTimer() { return db.prepare('DELETE FROM active_timer WHERE id = 1').run() }
