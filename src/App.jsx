import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import UploadScreen from './components/UploadScreen'
import DashboardScreen from './components/DashboardScreen'
import './App.css'

const TABS = [
  { id: 'upload', label: 'Upload', icon: '📷' },
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
]

export default function App() {
  const [tab, setTab] = useState('upload')

  return (
    <div className="app">
      <div className="app-content">
        {tab === 'upload' ? <UploadScreen /> : <DashboardScreen />}
      </div>
      <nav className="bottom-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-btn ${tab === t.id ? 'nav-btn--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: 'inherit', borderRadius: '10px', fontSize: '14px' },
          success: { iconTheme: { primary: '#1d6f42', secondary: '#fff' } },
        }}
      />
    </div>
  )
}
