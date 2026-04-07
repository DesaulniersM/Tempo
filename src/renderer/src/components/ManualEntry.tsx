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
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId || !duration || !date) return

    await window.api.addEntry(categoryId, Number(duration), date, notes)
    
    setCategoryId(null)
    setDuration('')
    setNotes('')
    onEntryAdded()
  }

  return (
    <div className="card manual-entry-card">
      <div className="card-header">
        <PlusCircle size={24} />
        <h2>Add Manual Entry</h2>
      </div>

      <form onSubmit={handleSubmit} className="manual-entry-form">
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select 
              value={categoryId || ''} 
              onChange={(e) => setCategoryId(Number(e.target.value))}
              required
            >
              <option value="" disabled>Select</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Hours</label>
            <input 
              type="number" 
              step="0.01" 
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
          <input 
            type="text" 
            placeholder="What did you do?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary">Add Entry</button>
      </form>
    </div>
  )
}

export default ManualEntry
