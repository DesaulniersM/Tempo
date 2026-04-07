import { useState, useEffect, useCallback } from 'react'
import { LayoutDashboard, Timer as TimerIcon, PlusCircle, Settings as SettingsIcon, Sun, Moon, BarChart3 } from 'lucide-react'
import Dashboard from './components/Dashboard'
import Timer from './components/Timer'
import ManualEntry from './components/ManualEntry'
import Settings from './components/Settings'
import Insights from './components/Insights'
import { Category, Entry, Summary } from '../../shared/types'

function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timer' | 'manual' | 'settings' | 'insights'>('dashboard')
  const [categories, setCategories] = useState<Category[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [summary, setSummary] = useState<Summary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  )
  const [quickStartCategoryId, setQuickStartCategoryId] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const cats = await window.api.getCategories()
      const ents = await window.api.getEntries()
      const summ = await window.api.getSummary()
      setCategories(cats)
      setEntries(ents)
      setSummary(summ)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleStartTimerFromDashboard = (categoryId: number) => {
    setQuickStartCategoryId(categoryId)
    setActiveTab('timer')
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  if (isLoading) {
    return <div className="loading">Initializing Tempo...</div>
  }

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="logo">
          Tempo
        </div>
        <div className="nav-items">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'timer' ? 'active' : ''}`}
            onClick={() => setActiveTab('timer')}
          >
            <TimerIcon size={20} />
            <span>Timer</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            <BarChart3 size={20} />
            <span>Insights</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            <PlusCircle size={20} />
            <span>Add Entry</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon size={20} />
            <span>Settings</span>
          </button>
        </div>

        <div className="theme-toggle">
          <button className="nav-item" onClick={toggleTheme} style={{ width: '100%' }}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>
      </nav>

      <main className="main-content">
        <header className="main-header">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="header-date">{new Date().toDateString()}</div>
        </header>

        <div className="content-area">
          {activeTab === 'dashboard' && (
            <Dashboard 
              summary={summary} 
              recentEntries={entries} 
              categories={categories}
              onRefresh={fetchData} 
              onStartTimer={handleStartTimerFromDashboard}
            />
          )}
          {activeTab === 'timer' && (
            <Timer 
              categories={categories} 
              onEntryAdded={fetchData} 
              quickStartId={quickStartCategoryId}
              onQuickStartHandled={() => setQuickStartCategoryId(null)}
            />
          )}
          {activeTab === 'insights' && (
            <Insights />
          )}
          {activeTab === 'manual' && (
            <ManualEntry categories={categories} onEntryAdded={fetchData} />
          )}
          {activeTab === 'settings' && (
            <Settings categories={categories} onRefresh={fetchData} />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
