import React, { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { Category } from '../../../shared/types'

interface ManualEntryProps {
  categories: Category[]
  onEntryAdded: () => void
}

const ManualEntry: React.FC<ManualEntryProps> = ({ categories, onEntryAdded }) => {
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [duration, setDuration] = useState('')
  const getLocalDate = () => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`
  }
  const [date, setDate] = useState(getLocalDate())
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId || !duration || !date) {
      alert('Please fill in all required fields (Category, Hours, and Date).')
      return
    }

    // For manual entries, we'll assume the work ended at the end of the selected day
    // This allows the duration-distribution logic to work reasonably.
    const [y, m, d] = date.split('-').map(Number)
    const createdAt = new Date(y, m - 1, d, 23, 59, 59, 999).toISOString()
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    await window.api.addEntry(categoryId, Number(duration), date, notes, 'manual', createdAt, timezone)
    
    setCategoryId(null)
    setDuration('')
    setNotes('')
    onEntryAdded()
    alert('Entry added successfully!')
  }

  return (
    <div className="card manual-entry-card">
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <PlusCircle size={24} color="var(--primary)" />
        <h2 style={{ margin: 0 }}>Add Manual Entry</h2>
      </div>

      <form onSubmit={handleSubmit} className="manual-entry-form">
        <div className="form-row">
          <div className="form-group">
            <label>Project</label>
            <select 
              value={categoryId || ''} 
              onChange={(e) => setCategoryId(Number(e.target.value))}
              required
            >
              <option value="" disabled>Select a project</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Hours</label>
            <input 
              type="text" 
              placeholder="e.g. 1.5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea 
            placeholder="What did you work on?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ minHeight: '80px' }}
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
          Add Time Entry
        </button>
      </form>
    </div>
  )
}

export default ManualEntry
