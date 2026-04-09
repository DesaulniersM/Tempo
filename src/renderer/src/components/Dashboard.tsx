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

    return { todayTotal, weekTotal, todayStr }
  }, [recentEntries])

  const streak = useMemo(() => {
    const dates = [...new Set(recentEntries.map(e => e.date))].sort().reverse()
    if (dates.length === 0) return 0
    let currentStreak = 0
    const now = new Date()
    let checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dToStr = (d: Date) => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
    const todayStr = dToStr(checkDate)
    if (dates[0] !== todayStr) {
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
        <div style={{ background: 'var(--primary-glow)', padding: '2rem', borderRadius: '50%', marginBottom: '2rem' }}><PlusCircle size={64} color="var(--primary)" /></div>
        <h1 style={{ marginBottom: '1rem' }}>Welcome to Tempo</h1>
        <p className="text-muted" style={{ maxWidth: '500px', marginBottom: '2.5rem' }}>Your tracking environment is ready. To begin, add a project or sync history.</p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div className="card" style={{ flex: 1, padding: '2rem' }}><h3>Manual Setup</h3><ArrowRight size={20} color="var(--primary)" /></div>
          <div className="card" style={{ flex: 1, padding: '2rem' }}><h3>Sync History</h3><ArrowRight size={20} color="var(--primary)" /></div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard" style={{ gap: '1.5rem' }}>
      <div className="stats-grid" style={{ marginBottom: 0 }}>
        <div className="stat-card card"><span className="stat-label">Today</span><span className="stat-value">{stats.todayTotal.toFixed(1)}h</span></div>
        <div className="stat-card card" style={{ position: 'relative', overflow: 'hidden' }}><span className="stat-label">Streak</span><span className="stat-value">{streak} Days</span>{streak > 0 && <Zap size={40} color="var(--primary)" style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }} />}</div>
        <div className="stat-card card"><span className="stat-label">This Week</span><span className="stat-value">{stats.weekTotal.toFixed(1)}h</span></div>
        <div className="stat-card card"><span className="stat-label">Focus</span><span className="stat-value" style={{ fontSize: '1.2rem' }}>{summary.sort((a,b) => b.total_duration - a.total_duration)[0]?.name || 'None'}</span></div>
      </div>

      <div className="quick-start-section">
        <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}><Zap size={18} fill="currentColor" /> Quick Start Flow</h2>
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
        
        <div className="card" style={{ marginBottom: 0 }}>
          <h2><Target size={18} color="var(--primary)" /> Daily Goals</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {summary.filter(s => (s.daily_target || 0) > 0).map(cat => {
              const current = recentEntries.filter(e => e.date === stats.todayStr && e.category_name === cat.name).reduce((acc, curr) => acc + curr.duration, 0)
              const isGoalMet = current >= cat.daily_target
              const percentage = Math.min((current / cat.daily_target) * 100, 100)
              return (
                <div key={cat.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 700 }}>{cat.name}</span>
                    <span style={{ fontWeight: 600 }}>{current.toFixed(1)} / {cat.daily_target}h</span>
                  </div>
                  <div className="progress-bar-bg" style={{ height: '6px' }}>
                    <div className={`progress-bar-fill ${isGoalMet ? 'golden-state' : ''}`} style={{ width: `${percentage}%`, backgroundColor: cat.color, ['--glow-color' as any]: `${cat.color}66` }} />
                  </div>
                </div>
              )
            })}
            {summary.filter(s => (s.daily_target || 0) > 0).length === 0 && <p className="text-muted" style={{ fontSize: '0.8rem', textAlign: 'center' }}>Set daily targets in Settings.</p>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        <div className="card chart-card" style={{ marginBottom: 0 }}>
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

        <div className="card targets-card" style={{ marginBottom: 0 }}>
          <h2><Target size={18} color="var(--primary)" /> Weekly Goals</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {summary.filter(s => (s.weekly_target || 0) > 0).map(cat => {
              const current = recentEntries.filter(e => {
                const now = new Date()
                const startOfWeek = new Date(now)
                startOfWeek.setDate(now.getDate() - now.getDay())
                startOfWeek.setHours(0,0,0,0)
                return e.category_name === cat.name && new Date(e.date + 'T00:00:00') >= startOfWeek
              }).reduce((acc, curr) => acc + curr.duration, 0)
              const isGoalMet = current >= cat.weekly_target
              const percentage = Math.min((current / cat.weekly_target) * 100, 100)
              return (
                <div key={cat.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 700 }}>{cat.name}</span>
                    <span style={{ color: isGoalMet ? cat.color : 'var(--text-muted)', fontWeight: 700 }}>{current.toFixed(1)} / {cat.weekly_target}h</span>
                  </div>
                  <div className="progress-bar-bg"><div className={`progress-bar-fill ${isGoalMet ? 'golden-state' : ''}`} style={{ width: `${percentage}%`, backgroundColor: cat.color, ['--glow-color' as any]: `${cat.color}66` }} /></div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card entries-card" style={{ marginBottom: 0 }}>
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
