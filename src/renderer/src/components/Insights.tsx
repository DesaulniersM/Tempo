import React, { useState, useEffect, useMemo } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts'
import { Summary, Entry } from '../../../shared/types'

type Range = '1W' | '1M' | '3M' | '6M' | '1Y' | 'All'

const Insights: React.FC = () => {
  const [range, setRange] = useState<Range>('1W')
  const [summary, setSummary] = useState<Summary[]>([])
  const [entries, setEntries] = useState<Entry[]>([])

  const fetchRangeData = async () => {
    const now = new Date()
    let startDate = new Date()

    switch (range) {
      case '1W': startDate.setDate(now.getDate() - 7); break
      case '1M': startDate.setMonth(now.getMonth() - 1); break
      case '3M': startDate.setMonth(now.getMonth() - 3); break
      case '6M': startDate.setMonth(now.getMonth() - 6); break
      case '1Y': startDate.setFullYear(now.getFullYear() - 1); break
      case 'All': startDate = new Date(0); break
    }

    const startStr = startDate.toISOString().split('T')[0]
    const [summ, ents] = await Promise.all([
      window.api.getSummaryByRange(startStr),
      window.api.getEntries(startStr)
    ])
    
    setSummary(summ)
    setEntries(ents)
  }

  useEffect(() => {
    fetchRangeData()
  }, [range])

  const totalHours = useMemo(() => 
    summary.reduce((acc, curr) => acc + (curr.total_duration || 0), 0), 
  [summary])

  const dailyAverage = useMemo(() => {
    let days = 1
    switch (range) {
      case '1W': days = 7; break
      case '1M': days = 30; break
      case '3M': days = 90; break
      case '6M': days = 180; break
      case '1Y': days = 365; break
      case 'All': 
        const uniqueDates = new Set(entries.map(e => e.date))
        days = uniqueDates.size || 1
        break
    }
    return totalHours / days
  }, [entries, totalHours, range])

  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      count: 0
    }))

    entries.forEach(entry => {
      // Skip imported entries as they lack accurate time-of-day metadata
      if (entry.created_at && entry.source !== 'import') {
        const date = new Date(entry.created_at)
        const hour = date.getHours()
        hours[hour].count += entry.duration
      }
    })
    return hours
  }, [entries])

  const ranges: Range[] = ['1W', '1M', '3M', '6M', '1Y', 'All']

  return (
    <div className="insights-page">
      <div className="range-selector card" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.75rem' }}>
        {ranges.map(r => (
          <button 
            key={r}
            className={`btn ${range === r ? 'btn-primary' : ''}`}
            onClick={() => setRange(r)}
            style={{ flex: 1, padding: '0.5rem' }}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="stats-grid">
        <div className="stat-card card">
          <span className="stat-label">Total Hours</span>
          <span className="stat-value">{totalHours.toFixed(1)}h</span>
        </div>
        <div className="stat-card card">
          <span className="stat-label">Daily Average</span>
          <span className="stat-value">{dailyAverage.toFixed(2)}h/day</span>
        </div>
        <div className="stat-card card">
          <span className="stat-label">Active Days</span>
          <span className="stat-value">{new Set(entries.map(e => e.date)).size}</span>
        </div>
      </div>

      <div className="card">
        <h2>Productivity Tendencies (Hours by Time of Day)</h2>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={10} />
              <YAxis stroke="var(--text-muted)" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-main)' }} 
              />
              <Bar dataKey="count" fill="var(--primary)" name="Hours Logged" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '1rem', textAlign: 'center' }}>
          This shows when you log your entries. High peaks indicate your most active work hours.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h2>Hours by Category</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={summary.filter(s => s.total_duration > 0)}
                  dataKey="total_duration"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => entry.name}
                >
                  {summary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-main)' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2>Time Distribution</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={summary.filter(s => s.total_duration > 0)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-main)' }} 
                />
                <Bar dataKey="total_duration">
                  {summary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Insights
