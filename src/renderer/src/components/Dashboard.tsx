import React, { useMemo } from 'react'
import Heatmap from './Heatmap'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import { Trash2, Target, Zap, Clock, Calendar, PlusCircle, ArrowRight } from 'lucide-react'
import { Summary, Entry, Category } from '../../../shared/types'

interface DashboardProps {
  summary: Summary[]
  recentEntries: Entry[]
  categories: Category[]
  onRefresh: () => void
  onStartTimer: (categoryId: number) => void
}

const Dashboard: React.FC<DashboardProps> = ({ 
  summary, 
  recentEntries, 
  categories, 
  onRefresh, 
  onStartTimer 
}) => {
  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      await window.api.deleteEntry(id)
      onRefresh()
    }
  }

  const weeklyProgress = useMemo(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const totals: Record<string, number> = {}
    recentEntries.forEach(e => {
      const entryDate = new Date(e.date + 'T00:00:00')
      if (entryDate >= startOfWeek) {
        totals[e.category_name] = (totals[e.category_name] || 0) + e.duration
      }
    })
    return totals
  }, [recentEntries])

  const totalThisWeek = useMemo(() => 
    Object.values(weeklyProgress).reduce((a, b) => a + b, 0), 
  [weeklyProgress])

  const isEmpty = categories.length === 0 && recentEntries.length === 0

  if (isEmpty) {
    return (
      <div className="dashboard empty-state-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ background: 'var(--primary-glow)', padding: '2rem', borderRadius: '50%', marginBottom: '2rem' }}>
          <PlusCircle size={64} color="var(--primary)" />
        </div>
        <h1 style={{ marginBottom: '1rem' }}>Welcome to ScholarTrack</h1>
        <p className="text-muted" style={{ maxWidth: '500px', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
          Your PhD time tracking environment is ready. To begin visualizing your "Flow," either add your first project or import your Google Sheet history.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div className="card" style={{ flex: 1, cursor: 'default', padding: '2rem' }}>
            <h3>Manual Setup</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', margin: '1rem 0' }}>Add your research categories manually in Settings.</p>
            <ArrowRight size={20} color="var(--primary)" />
          </div>
          <div className="card" style={{ flex: 1, cursor: 'default', padding: '2rem' }}>
            <h3>Sync History</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', margin: '1rem 0' }}>Paste your spreadsheet rows to populate your dashboard instantly.</p>
            <ArrowRight size={20} color="var(--primary)" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="stats-grid" style={{ marginBottom: 0 }}>
        <div className="stat-card card">
          <span className="stat-label">This Week</span>
          <span className="stat-value">{totalThisWeek.toFixed(1)}h</span>
        </div>
        <div className="stat-card card">
          <span className="stat-label">Total Logs</span>
          <span className="stat-value">{recentEntries.length}</span>
        </div>
        <div className="stat-card card">
          <span className="stat-label">Main Project</span>
          <span className="stat-value" style={{ fontSize: '1.25rem' }}>
            {summary.sort((a,b) => b.total_duration - a.total_duration)[0]?.name || 'None'}
          </span>
        </div>
      </div>

      <Heatmap entries={recentEntries} />
      
      {categories.length > 0 && (
        <div className="quick-start-section">
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}><Zap size={18} fill="currentColor" /> Quick Start Flow</h2>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {categories.map(cat => (
              <button 
                key={cat.id} 
                className="card" 
                onClick={() => onStartTimer(cat.id)}
                style={{ 
                  flex: '0 0 150px', 
                  textAlign: 'center', 
                  padding: '1.25rem', 
                  cursor: 'pointer',
                  borderTop: `4px solid ${cat.color}`,
                  marginBottom: 0
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{cat.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        <div className="card chart-card" style={{ marginBottom: 0 }}>
          <h2><Calendar size={18} /> Time Allocation</h2>
          {recentEntries.length === 0 ? (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', borderRadius: '8px' }}>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Start tracking to see your data visualization.</p>
            </div>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={summary}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-card)', 
                      borderColor: 'var(--border)', 
                      color: 'var(--text-main)',
                      borderRadius: '8px',
                      boxShadow: 'var(--shadow-md)'
                    }} 
                  />
                  <Bar dataKey="total_duration" name="Hours" radius={[4, 4, 0, 0]}>
                    {summary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card targets-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Target size={18} color="var(--primary)" />
            <h2 style={{ margin: 0 }}>Weekly Goals</h2>
          </div>
          <div className="targets-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {summary.filter(s => (s.weekly_target || 0) > 0).map(cat => {
              const current = weeklyProgress[cat.name] || 0
              const percentage = Math.min((current / cat.weekly_target) * 100, 100)
              return (
                <div key={cat.name} className="target-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.625rem', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 700 }}>{cat.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                      {current.toFixed(1)} / {cat.weekly_target}h
                    </span>
                  </div>
                  <div className="progress-bar-bg" style={{ height: '8px', background: 'var(--bg-main)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        height: '100%', 
                        width: `${percentage}%`, 
                        backgroundColor: cat.color,
                        boxShadow: `0 0 8px ${cat.color}44`
                      }} 
                    />
                  </div>
                </div>
              )
            })}
            {summary.filter(s => (s.weekly_target || 0) > 0).length === 0 && (
              <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px' }}>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>No goals set. Define them in Settings to stay on track.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card entries-card" style={{ marginBottom: 0 }}>
        <h2><Clock size={18} /> Recent History</h2>
        <div className="entries-list">
          {recentEntries.length === 0 ? (
            <p className="empty-state">No activity logged yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Project</th>
                  <th>Duration</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.slice(0, 8).map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{entry.date}</td>
                    <td>
                      <span className="category-tag" style={{ backgroundColor: entry.category_color }}>
                        {entry.category_name}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{Number(entry.duration).toFixed(2)}h</td>
                    <td className="entry-notes" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{entry.notes}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-icon delete" onClick={() => handleDelete(entry.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
