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
import { Trash2, Target, Zap, Clock, Calendar, PlusCircle } from 'lucide-react'
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

  const stats = useMemo(() => {
    const now = new Date()
    const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    let todayTotal = 0
    let weekTotal = 0
    recentEntries.forEach(e => {
      if (e.date === todayStr) todayTotal += e.duration
      const entryDateObj = new Date(e.date + 'T00:00:00')
      if (entryDateObj >= startOfWeek) weekTotal += e.duration
    })
    return { todayTotal, weekTotal, todayStr, startOfWeek }
  }, [recentEntries])

  // Improved Hierarchical Logic
  const processedGoals = useMemo(() => {
    const getProjectTotal = (catId: number, isDaily: boolean) => {
      // Find all children of THIS specific project
      const childrenIds = categories.filter(c => c.parent_id === catId).map(c => c.id)
      const targetIds = [catId, ...childrenIds]
      
      return recentEntries.filter(e => {
        const isMatch = targetIds.includes(e.category_id)
        if (!isMatch) return false
        if (isDaily) return e.date === stats.todayStr
        return new Date(e.date + 'T00:00:00') >= stats.startOfWeek
      }).reduce((acc, curr) => acc + curr.duration, 0)
    }

    // Sort summary so parents are followed immediately by their children
    const sortedSummary = [...summary].sort((a, b) => {
      const parentA = a.parent_id || a.id
      const parentB = b.parent_id || b.id
      if (parentA === parentB) {
        return (a.parent_id ? 1 : -1) - (b.parent_id ? 1 : -1)
      }
      return parentA - parentB
    })

    return sortedSummary.map(s => ({
      ...s,
      currentDaily: getProjectTotal(s.id, true),
      currentWeekly: getProjectTotal(s.id, false)
    }))
  }, [summary, recentEntries, categories, stats])

  const streak = useMemo(() => {
    const dates = [...new Set(recentEntries.map(e => e.date))].sort().reverse()
    if (dates.length === 0) return 0
    let currentStreak = 0
    const now = new Date()
    let checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dToStr = (d: Date) => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
    if (dates[0] !== dToStr(checkDate)) {
      checkDate.setDate(checkDate.getDate() - 1)
      if (dates[0] !== dToStr(checkDate)) return 0
    }
    let dateIdx = 0
    while (dateIdx < dates.length) {
      if (dates[dateIdx] === dToStr(checkDate)) {
        currentStreak++
        dateIdx++
        checkDate.setDate(checkDate.getDate() - 1)
      } else break
    }
    return currentStreak
  }, [recentEntries])

  if (categories.length === 0 && recentEntries.length === 0) {
    return (
      <div className="dashboard empty-state-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
        <PlusCircle size={64} color="var(--primary)" />
        <h1>Welcome to Tempo</h1>
        <p className="text-muted">Start by adding projects or syncing history in Settings.</p>
      </div>
    )
  }

  return (
    <div className="dashboard" style={{ gap: '1.5rem' }}>
      <div className="stats-grid">
        <div className="stat-card card"><span className="stat-label">Today</span><span className="stat-value">{stats.todayTotal.toFixed(1)}h</span></div>
        <div className="stat-card card" style={{ position: 'relative', overflow: 'hidden' }}><span className="stat-label">Streak</span><span className="stat-value">{streak} Days</span>{streak > 0 && <Zap size={40} color="var(--primary)" style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }} />}</div>
        <div className="stat-card card"><span className="stat-label">This Week</span><span className="stat-value">{stats.weekTotal.toFixed(1)}h</span></div>
        <div className="stat-card card"><span className="stat-label">Focus</span><span className="stat-value" style={{ fontSize: '1.2rem' }}>{summary.sort((a,b) => b.total_duration - a.total_duration)[0]?.name || 'None'}</span></div>
      </div>

      <div className="quick-start-section">
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {categories.map(cat => (
            <button key={cat.id} className="card" onClick={() => onStartTimer(cat.id)} style={{ flex: '0 0 140px', textAlign: 'center', padding: '1rem', cursor: 'pointer', borderTop: `4px solid ${cat.color}`, marginBottom: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{cat.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        <Heatmap entries={recentEntries} />
        
        <div className="card">
          <h2><Target size={18} color="var(--primary)" /> Daily Goals</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {processedGoals.filter(s => (s.daily_target || 0) > 0).map(cat => {
              const isGoalMet = cat.currentDaily >= cat.daily_target
              const percentage = Math.min((cat.currentDaily / cat.daily_target) * 100, 100)
              return (
                <div key={cat.id} style={{ marginLeft: cat.parent_id ? '1.5rem' : '0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 700 }}>{cat.name} {cat.parent_id && '↳'}</span>
                    <span style={{ fontWeight: 600 }}>{cat.currentDaily.toFixed(1)} / {cat.daily_target}h</span>
                  </div>
                  <div className="progress-bar-bg" style={{ height: '6px' }}>
                    <div className={`progress-bar-fill ${isGoalMet ? 'golden-state' : ''}`} style={{ width: `${percentage}%`, backgroundColor: cat.color, ['--glow-color' as any]: `${cat.color}66` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        <div className="card chart-card">
          <h2><Calendar size={18} /> Allocation</h2>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={summary}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} />
                <YAxis stroke="var(--text-muted)" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-main)', borderRadius: '8px' }} />
                <Bar dataKey="total_duration" name="Hours" radius={[4, 4, 0, 0]}>
                  {summary.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card targets-card">
          <h2><Target size={18} color="var(--primary)" /> Weekly Goals</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {processedGoals.filter(s => (s.weekly_target || 0) > 0).map(cat => {
              const isGoalMet = cat.currentWeekly >= cat.weekly_target
              const percentage = Math.min((cat.currentWeekly / cat.weekly_target) * 100, 100)
              return (
                <div key={cat.id} style={{ marginLeft: cat.parent_id ? '1.5rem' : '0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 700 }}>{cat.name} {cat.parent_id && '↳'}</span>
                    <span style={{ color: isGoalMet ? cat.color : 'var(--text-muted)', fontWeight: 700 }}>{cat.currentWeekly.toFixed(1)} / {cat.weekly_target}h</span>
                  </div>
                  <div className="progress-bar-bg"><div className={`progress-bar-fill ${isGoalMet ? 'golden-state' : ''}`} style={{ width: `${percentage}%`, backgroundColor: cat.color, ['--glow-color' as any]: `${cat.color}66` }} /></div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card entries-card">
        <h2><Clock size={18} /> History</h2>
        <div className="entries-list">
          <table>
            <thead><tr><th>Date</th><th>Project</th><th>Duration</th><th>Notes</th><th></th></tr></thead>
            <tbody>
              {recentEntries.slice(0, 8).map((entry) => (
                <tr key={entry.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{entry.date}</td>
                  <td><span className="category-tag" style={{ backgroundColor: entry.category_color }}>{entry.category_name}</span></td>
                  <td style={{ fontWeight: 700 }}>{Number(entry.duration).toFixed(2)}h</td>
                  <td style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{entry.notes}</td>
                  <td style={{ textAlign: 'right' }}><button className="btn-icon delete" onClick={() => handleDelete(entry.id)}><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
