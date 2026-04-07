import React, { useMemo } from 'react'
import { Entry } from '../../../shared/types'

interface HeatmapProps {
  entries: Entry[]
}

const Heatmap: React.FC<HeatmapProps> = ({ entries }) => {
  const heatmapData = useMemo(() => {
    const data: Record<string, number> = {}
    
    // Aggregate duration by date
    entries.forEach(entry => {
      data[entry.date] = (data[entry.date] || 0) + entry.duration
    })

    // Generate last 12 weeks of dates
    const weeks: string[][] = []
    const today = new Date()
    // Start from 12 weeks ago (aligned to Sunday)
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - (12 * 7) - today.getDay())

    for (let w = 0; w < 13; w++) {
      const week: string[] = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + (w * 7) + d)
        week.push(date.toISOString().split('T')[0])
      }
      weeks.push(week)
    }
    return { weeks, intensity: data }
  }, [entries])

  const getColor = (hours: number) => {
    if (hours === 0) return 'var(--border)'
    if (hours < 2) return '#93c5fd'
    if (hours < 4) return '#60a5fa'
    if (hours < 7) return '#3b82f6'
    return '#1d4ed8'
  }

  return (
    <div className="card">
      <h2>Activity Flow (Last 3 Months)</h2>
      <div className="heatmap-container">
        {heatmapData.weeks.map((week, wi) => (
          <div key={wi} className="heatmap-week">
            {week.map(date => {
              const hours = heatmapData.intensity[date] || 0
              return (
                <div 
                  key={date} 
                  className="heatmap-day" 
                  style={{ backgroundColor: getColor(hours) }}
                  title={`${date}: ${hours.toFixed(2)}h`}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Less</span>
        <div style={{ display: 'flex', gap: '2px' }}>
          {[0, 1, 3, 5, 8].map(h => <div key={h} className="heatmap-day" style={{ backgroundColor: getColor(h) }} />)}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

export default Heatmap
