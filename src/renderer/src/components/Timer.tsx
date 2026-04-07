import React, { useState, useEffect, useRef } from 'react'
import { Play, Square, Timer as TimerIcon } from 'lucide-react'
import { Category } from '../../../shared/types'

interface TimerProps {
  categories: Category[]
  onEntryAdded: () => void
  quickStartId?: number | null
  onQuickStartHandled?: () => void
}

const Timer: React.FC<TimerProps> = ({ 
  categories, 
  onEntryAdded, 
  quickStartId, 
  onQuickStartHandled 
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [notes, setNotes] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Handle Quick Start from Dashboard
  useEffect(() => {
    if (quickStartId && !isRunning) {
      setActiveCategoryId(quickStartId)
      // Small delay to ensure state is set before starting
      setTimeout(() => {
        handleStart(quickStartId)
      }, 0)
      onQuickStartHandled?.()
    }
  }, [quickStartId])

  // Load active timer on mount
  useEffect(() => {
    const loadActiveTimer = async () => {
      const active = await window.api.getActiveTimer()
      if (active) {
        const start = new Date(active.start_time).getTime()
        const now = new Date().getTime()
        const diff = Math.floor((now - start) / 1000)
        
        setActiveCategoryId(active.category_id)
        setSeconds(diff > 0 ? diff : 0)
        setNotes(active.notes || '')
        setIsRunning(true)
        startTimeRef.current = start
      }
    }
    loadActiveTimer()
  }, [])

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const now = new Date().getTime()
          setSeconds(Math.floor((now - startTimeRef.current) / 1000))
        } else {
          setSeconds((prev) => prev + 1)
        }
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning])

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = async (catIdOverride?: number) => {
    const catId = catIdOverride || activeCategoryId
    if (catId) {
      const startTime = new Date().toISOString()
      await window.api.saveActiveTimer(catId, startTime, notes)
      startTimeRef.current = new Date(startTime).getTime()
      setIsRunning(true)
    }
  }

  const handleStop = async () => {
    if (!activeCategoryId) return

    const durationHours = seconds / 3600
    const today = new Date().toISOString().split('T')[0]

    await window.api.addEntry(activeCategoryId, durationHours, today, notes)
    await window.api.clearActiveTimer()
    
    setIsRunning(false)
    setSeconds(0)
    setNotes('')
    startTimeRef.current = null
    onEntryAdded()
  }

  return (
    <div className="card timer-card">
      <div className="timer-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <TimerIcon size={24} color="var(--primary)" />
        <h2 style={{ margin: 0 }}>Deep Work Flow</h2>
      </div>
      
      <div className="timer-display">
        {formatTime(seconds)}
      </div>

      <div className="timer-controls">
        <select 
          value={activeCategoryId || ''} 
          onChange={(e) => setActiveCategoryId(Number(e.target.value))}
          disabled={isRunning}
          className="category-select"
        >
          <option value="" disabled>Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {isRunning ? (
          <button onClick={handleStop} className="btn btn-stop" style={{ padding: '1rem', width: '100%' }}>
            <Square size={24} fill="currentColor" /> Finish Flow
          </button>
        ) : (
          <button onClick={() => handleStart()} className="btn btn-start" disabled={!activeCategoryId} style={{ padding: '1rem', width: '100%' }}>
            <Play size={24} fill="currentColor" /> Enter Flow State
          </button>
        )}
      </div>

      <div className="timer-notes" style={{ marginTop: '1.5rem' }}>
        <textarea
          placeholder="Focusing on..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="notes-input"
          disabled={isRunning}
          style={{ width: '100%', height: '100px' }}
        />
      </div>
    </div>
  )
}

export default Timer
