import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import UploadScreen from './components/UploadScreen'
import DashboardScreen from './components/DashboardScreen'
import './App.css'

function IconCamera({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}

function IconChart({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )
}

const TABS = [
  { id: 'upload', label: 'Upload', Icon: IconCamera },
  { id: 'dashboard', label: 'Dashboard', Icon: IconChart },
]

export default function App() {
  const [tab, setTab] = useState('upload')

  return (
    <div className="app">
      <div className="app-content">
        {tab === 'upload' ? <UploadScreen /> : <DashboardScreen />}
      </div>
      <nav className="bottom-nav">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-btn ${tab === id ? 'nav-btn--active' : ''}`}
            onClick={() => setTab(id)}
          >
            <span className="nav-icon"><Icon /></span>
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </nav>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: 'inherit', borderRadius: '10px', fontSize: '14px' },
          success: { iconTheme: { primary: '#3db549', secondary: '#fff' } },
        }}
      />
    </div>
  )
}
