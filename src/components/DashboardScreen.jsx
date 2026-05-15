import { useState, useEffect, useCallback } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'
import { formatDistanceToNow } from 'date-fns'

const TARGET = 1000

function MetricCard({ label, value }) {
  return (
    <div className="metric-card">
      <span className="metric-value">{value ?? '—'}</span>
      <span className="metric-label">{label}</span>
    </div>
  )
}

function CoverageBar({ category, count }) {
  const pct = Math.min((count / TARGET) * 100, 100)
  const color = count >= 500 ? 'var(--green)' : count >= 200 ? 'var(--amber)' : 'var(--red)'
  return (
    <div className="coverage-row">
      <div className="coverage-info">
        <span className="coverage-name">{category}</span>
        <span className="coverage-count" style={{ color }}>{count} / {TARGET}</span>
      </div>
      <div className="coverage-track">
        <div className="coverage-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function exportCSV(rows) {
  const headers = ['id', 'created_at', 'item_name', 'category', 'presentation', 'angle', 'branch', 'uploaded_by', 'notes', 'image_url']
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(',')),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `smartproduce-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function DashboardScreen() {
  const [metrics, setMetrics] = useState({})
  const [categoryCoverage, setCategoryCoverage] = useState([])
  const [recent, setRecent] = useState([])
  const [allRows, setAllRows] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!supabaseReady) { setLoading(false); return }

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [
      { count: total },
      { data: allData },
      { count: thisWeek },
    ] = await Promise.all([
      supabase.from('uploads').select('*', { count: 'exact', head: true }),
      supabase.from('uploads').select('*').order('created_at', { ascending: false }),
      supabase.from('uploads').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
    ])

    const rows = allData || []
    setAllRows(rows)
    setRecent(rows.slice(0, 20))

    const categories = new Set(rows.map(r => r.category || r.item_name).filter(Boolean))
    const branches = new Set(rows.map(r => r.branch).filter(Boolean))

    setMetrics({
      total: total || 0,
      categories: categories.size,
      branchesActive: branches.size,
      thisWeek: thisWeek || 0,
    })

    // Group by category (fall back to item_name for older rows without category)
    const counts = {}
    rows.forEach(r => {
      const cat = r.category || r.item_name
      if (cat) counts[cat] = (counts[cat] || 0) + 1
    })
    const sorted = Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
    setCategoryCoverage(sorted)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const header = (
    <header className="header">
      <div className="header-inner">
        <img src="/keells-logo.png" alt="SmartProduce" className="header-logo" />
        <div>
          <h1 className="header-title">Dashboard</h1>
          <p className="header-sub">SmartProduce Data Collector</p>
        </div>
      </div>
    </header>
  )

  if (loading) {
    return (
      <div className="screen">
        {header}
        <div className="screen-body center">
          <span className="spinner spinner--large" />
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      {header}
      <div className="screen-body">
        {!supabaseReady && (
          <div className="setup-banner">
            Add your <code>.env</code> credentials to load live data
          </div>
        )}

        <div className="metrics-grid">
          <MetricCard label="Total Images" value={metrics.total} />
          <MetricCard label="Categories" value={metrics.categories} />
          <MetricCard label="Branches Active" value={metrics.branchesActive} />
          <MetricCard label="This Week" value={metrics.thisWeek} />
        </div>

        <div className="card">
          <h2 className="card-title">Coverage by Category</h2>
          <p className="card-sub">Target: {TARGET} images per category</p>
          {categoryCoverage.length === 0
            ? <p className="empty">No data yet</p>
            : categoryCoverage.map(({ category, count }) => (
              <CoverageBar key={category} category={category} count={count} />
            ))
          }
        </div>

        <div className="card">
          <div className="card-header-row">
            <h2 className="card-title">Recent Uploads</h2>
            <button
              className="export-btn"
              onClick={() => exportCSV(allRows)}
              disabled={allRows.length === 0}
            >
              Export CSV
            </button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Pres.</th>
                  <th>Branch</th>
                  <th>By</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr><td colSpan={6} className="empty">No uploads yet</td></tr>
                ) : recent.map(r => (
                  <tr key={r.id}>
                    <td>{r.item_name}</td>
                    <td>{r.category || '—'}</td>
                    <td className={`pres-badge pres-badge--${r.presentation}`}>
                      {r.presentation || '—'}
                    </td>
                    <td>{r.branch || '—'}</td>
                    <td>{r.uploaded_by || '—'}</td>
                    <td className="time-cell">
                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
