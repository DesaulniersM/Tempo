import React, { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X, Upload, Download, Loader2, FileSpreadsheet } from 'lucide-react'
import { Category } from '../../../shared/types'

interface SettingsProps {
  categories: Category[]
  onRefresh: () => void
}

const Settings: React.FC<SettingsProps> = ({ categories, onRefresh }) => {
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#3b82f6')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [editTarget, setEditTarget] = useState<number>(0)
  
  const [isImporting, setIsImporting] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName) return
    await window.api.addCategory(newCatName, newCatColor)
    setNewCatName('')
    onRefresh()
  }

  const handleDelete = async (id: number) => {
    try {
      if (confirm('Are you sure? Categories with existing entries cannot be deleted.')) {
        await window.api.deleteCategory(id)
        onRefresh()
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete category')
    }
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditColor(cat.color)
    setEditTarget(cat.weekly_target || 0)
  }

  const handleUpdate = async (id: number) => {
    await window.api.updateCategory(id, editName, editColor, editTarget)
    setEditingId(null)
    onRefresh()
  }

  const handleImportFile = async () => {
    const filePath = await window.api.openFile()
    if (!filePath) return

    setIsImporting(true)
    try {
      const content = await window.api.readFile(filePath)
      if (!content) throw new Error('Could not read file')

      const result = await window.api.importRawData(content)
      if (result.success) {
        alert(`Success! Imported ${result.count} entries from your CSV.`)
        onRefresh()
      } else {
        alert(`Import Error: ${result.message}`)
      }
    } catch (err: any) {
      console.error(err)
      alert(`Error during import: ${err.message}`)
    } finally {
      setIsImporting(false)
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    const entries = await window.api.getEntries()
    let content = ''
    let fileName = `scholartrack-export-${new Date().toISOString().split('T')[0]}.${format}`

    if (format === 'json') {
      content = JSON.stringify(entries, null, 2)
    } else {
      const headers = ['id', 'date', 'category', 'duration', 'notes', 'created_at']
      content = headers.join(',') + '\n'
      content += entries.map(e => 
        [e.id, e.date, `"${e.category_name}"`, e.duration, `"${(e.notes || '').replace(/"/g, '""')}"`, e.created_at].join(',')
      ).join('\n')
    }

    const success = await window.api.saveFile(content, fileName)
    if (success) alert('Export successful!')
  }

  return (
    <div className="settings-page">
      <div className="card">
        <h2>Manage Categories & Goals</h2>
        
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <input 
            type="text" 
            placeholder="Add new research category..." 
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            style={{ flex: 1 }}
          />
          <input 
            type="color" 
            value={newCatColor}
            onChange={(e) => setNewCatColor(e.target.value)}
            style={{ width: '50px' }}
          />
          <button type="submit" className="btn btn-primary">
            <Plus size={18} /> Add
          </button>
        </form>

        <div className="categories-list">
          {categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-main)', borderRadius: '12px' }}>
              <p className="text-muted">No projects found. Import your Google Sheet history to begin!</p>
            </div>
          ) : (
            categories.map(cat => (
              <div key={cat.id} className="category-item">
                {editingId === cat.id ? (
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%', alignItems: 'center' }}>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ flex: 2 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700 }}>GOAL:</label>
                      <input type="number" value={editTarget} onChange={(e) => setEditTarget(Number(e.target.value))} style={{ width: '65px' }} />
                    </div>
                    <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} style={{ width: '40px' }} />
                    <button onClick={() => handleUpdate(cat.id)} className="btn-icon" style={{ color: '#10b981' }}><Check size={18} /></button>
                    <button onClick={() => setEditingId(null)} className="btn-icon"><X size={18} /></button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div className="color-dot" style={{ backgroundColor: cat.color }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{cat.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: {cat.weekly_target || 0}h / week</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => startEdit(cat)} className="btn-icon"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(cat.id)} className="btn-icon delete"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FileSpreadsheet size={20} color="var(--primary)" />
            <h2 style={{ margin: 0 }}>Sync Google Sheet</h2>
          </div>
          <div style={{ flex: 1 }}>
            <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Download your Google Sheet as a <strong>.csv</strong> file, then select it here. We'll automatically create your projects and migrate all your research hours.
            </p>
            <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--border)', textAlign: 'center', marginBottom: '1.5rem' }}>
              <Upload size={32} color="var(--text-muted)" style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Only .csv files supported</p>
            </div>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={handleImportFile} 
            disabled={isImporting} 
            style={{ width: '100%', height: '48px', fontSize: '1rem' }}
          >
            {isImporting ? <Loader2 className="animate-spin" /> : 'Select CSV File to Import'}
          </button>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Download size={20} color="var(--primary)" />
            <h2 style={{ margin: 0 }}>Backup & Export</h2>
          </div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Keep a local copy of your database. You can export your data at any time to CSV (for Excel) or JSON (for data science).
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn" style={{ padding: '0.75rem', justifyContent: 'flex-start' }} onClick={() => handleExport('csv')}>
              <Download size={16} /> Export as CSV
            </button>
            <button className="btn" style={{ padding: '0.75rem', justifyContent: 'flex-start' }} onClick={() => handleExport('json')}>
              <Download size={16} /> Export as JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
