import React, { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X, Download, Loader2, FileSpreadsheet } from 'lucide-react'
import { Category } from '../../../shared/types'

interface SettingsProps {
  categories: Category[]
  onRefresh: () => void
}

const Settings: React.FC<SettingsProps> = ({ categories, onRefresh }) => {
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#3b82f6')
  const [newParentId, setNewParentId] = useState<string>('')
  
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [editWeeklyTarget, setEditWeeklyTarget] = useState<string>('0')
  const [editDailyTarget, setEditDailyTarget] = useState<string>('0')
  const [editParentId, setEditParentId] = useState<string>('')
  
  const [isImporting, setIsImporting] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName) return
    await window.api.addCategory(newCatName, newCatColor, newParentId ? Number(newParentId) : null)
    setNewCatName('')
    setNewParentId('')
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
    setEditWeeklyTarget(String(cat.weekly_target || 0))
    setEditDailyTarget(String(cat.daily_target || 0))
    setEditParentId(String(cat.parent_id || ''))
  }

  const handleUpdate = async (e?: React.FormEvent, id?: number) => {
    if (e) e.preventDefault()
    const targetId = id || editingId
    if (!targetId) return

    await window.api.updateCategory(
      targetId, 
      editName, 
      editColor, 
      Number(editWeeklyTarget), 
      Number(editDailyTarget),
      editParentId ? Number(editParentId) : null
    )
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
        alert(`Success! Imported ${result.count} entries.`)
        onRefresh()
      } else alert(`Import Error: ${result.message}`)
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
    let fileName = `tempo-export-${new Date().toISOString().split('T')[0]}.${format}`
    if (format === 'json') content = JSON.stringify(entries, null, 2)
    else {
      const headers = ['id', 'date', 'category', 'duration', 'notes', 'created_at']
      content = headers.join(',') + '\n' + entries.map(e => [e.id, e.date, `"${e.category_name}"`, e.duration, `"${(e.notes || '').replace(/"/g, '""')}"`, e.created_at].join(',')).join('\n')
    }
    const success = await window.api.saveFile(content, fileName)
    if (success) alert('Export successful!')
  }

  return (
    <div className="settings-page">
      <div className="card">
        <h2>Manage Projects & Targets</h2>
        
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Add new project..." 
            value={newCatName} 
            onChange={(e) => setNewCatName(e.target.value)} 
            style={{ flex: '2 1 200px' }} 
          />
          <select 
            value={newParentId} 
            onChange={(e) => setNewParentId(e.target.value)}
            style={{ flex: '1 1 150px' }}
          >
            <option value="">No Parent (Main)</option>
            {categories.filter(c => !c.parent_id).map(c => (
              <option key={c.id} value={c.id}>Under {c.name}</option>
            ))}
          </select>
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
          {categories.map(cat => (
            <div key={cat.id} className="category-item">
              {editingId === cat.id ? (
                <form onSubmit={(e) => handleUpdate(e, cat.id)} style={{ display: 'flex', gap: '0.75rem', width: '100%', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ flex: 2, minWidth: '120px' }} />
                  
                  <select 
                    value={editParentId} 
                    onChange={(e) => setEditParentId(e.target.value)}
                    style={{ flex: 1, minWidth: '120px' }}
                  >
                    <option value="">No Parent</option>
                    {categories.filter(c => c.id !== cat.id && !c.parent_id).map(c => (
                      <option key={c.id} value={c.id}>Under {c.name}</option>
                    ))}
                  </select>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.7rem' }}>DAILY:</label>
                    <input type="text" value={editDailyTarget} onChange={(e) => setEditDailyTarget(e.target.value)} style={{ width: '50px' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.7rem' }}>WEEKLY:</label>
                    <input type="text" value={editWeeklyTarget} onChange={(e) => setEditWeeklyTarget(e.target.value)} style={{ width: '50px' }} />
                  </div>
                  <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} style={{ width: '40px' }} />
                  <button type="submit" className="btn-icon" style={{ color: '#10b981' }}><Check size={18} /></button>
                  <button type="button" onClick={() => setEditingId(null)} className="btn-icon"><X size={18} /></button>
                </form>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <div className="color-dot" style={{ backgroundColor: cat.color }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ fontWeight: 700 }}>{cat.name}</div>
                      {cat.parent_id && (
                        <span style={{ fontSize: '0.7rem', background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                          Child of {categories.find(c => c.id === cat.parent_id)?.name}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Goal: {cat.daily_target || 0}h daily / {cat.weekly_target || 0}h weekly
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => startEdit(cat)} className="btn-icon"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(cat.id)} className="btn-icon delete"><Trash2 size={14} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FileSpreadsheet size={20} color="var(--primary)" />
            <h2 style={{ margin: 0 }}>Sync History</h2>
          </div>
          <button className="btn btn-primary" onClick={handleImportFile} disabled={isImporting} style={{ width: '100%', height: '45px' }}>
            {isImporting ? <Loader2 className="animate-spin" /> : 'Select CSV File'}
          </button>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Download size={20} color="var(--primary)" />
            <h2 style={{ margin: 0 }}>Export</h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn" style={{ flex: 1 }} onClick={() => handleExport('csv')}>.CSV</button>
            <button className="btn" style={{ flex: 1 }} onClick={() => handleExport('json')}>.JSON</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
