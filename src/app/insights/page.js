"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ColumnChart from '../../components/ColumnChart'
import AIInsights from '../../components/AIInsights'

export default function InsightsPage() {
  const [analysis, setAnalysis] = useState(null)
  const [selected, setSelected] = useState(null)
  const router = useRouter()

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('analysis')
      if (raw) setAnalysis(JSON.parse(raw))
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    try {
      const rawSel = sessionStorage.getItem('selectedColumn')
      if (rawSel) setSelected(rawSel)
    } catch (e) { console.error(e) }
  }, [])

  if (!analysis) return (
    <div className="card" style={{maxWidth: '600px', margin: '2rem auto', textAlign: 'center'}}>
      <h2>💡 Detailed Insights</h2>
      <p>No analysis found. Please run analysis from the Preview page.</p>
      <a href="/preview" className="btn">← Back to Preview</a>
    </div>
  )

  // safe access: analysis uses `columnStats` for per-column summaries
  const datasetRaw = typeof window !== 'undefined' ? sessionStorage.getItem('dataset') : null
  let dataset = null
  try { dataset = datasetRaw ? JSON.parse(datasetRaw) : null } catch (e) { dataset = null }

  const columnName = selected
  const columnStats = analysis && analysis.columnStats ? analysis.columnStats : null
  const column = columnName && columnStats ? { name: columnName, ...columnStats[columnName] } : null
  const columnAI = analysis && analysis.columnAI ? analysis.columnAI[columnName] : null

  return (
    <div>
      <h1 style={{marginBottom: '0.5rem', color: 'var(--light-mocha)'}}>💡 Detailed Insights</h1>
      {column ? (
        <div>
          <div className="card" style={{marginBottom: '2rem'}}>
            <h2 style={{marginBottom: '1rem'}}>{columnName}</h2>
            <ColumnChart column={columnName} stats={columnStats} data={dataset || []} selectedColumn={columnName} />
          </div>
          <div className="card">
            <AIInsights insights={columnAI} />
          </div>
        </div>
      ) : (
        <div className="card" style={{textAlign: 'center', padding: '2rem'}}>
          <p style={{color: 'var(--warm-taupe)', marginBottom: '1.5rem'}}>Select a column from the Analysis page to view insights.</p>
          <button className="btn" onClick={() => router.push('/analysis')}>← Back to Analysis</button>
        </div>
      )}
      <div style={{marginTop: '2rem', textAlign: 'center'}}>
        <button className="btn secondary" onClick={() => router.push('/analysis')}>← Back to Analysis</button>
      </div>
    </div>
  )
}
