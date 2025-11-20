"use client"
import FileUpload from '../components/FileUpload'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function Home() {
  const router = useRouter()
  const [recentAnalyses, setRecentAnalyses] = React.useState([])

  React.useEffect(() => {
    // Load recent analyses from localStorage
    try {
      const stored = localStorage.getItem('recentAnalyses')
      if (stored) setRecentAnalyses(JSON.parse(stored))
    } catch (e) { console.error(e) }
  }, [])

  function handleData(data) {
    try {
      sessionStorage.setItem('dataset', JSON.stringify(data))
      sessionStorage.removeItem('analysis')
      
      // Save to recent analyses
      const recent = {
        id: Date.now(),
        name: 'New Analysis',
        rows: data.length,
        timestamp: new Date().toLocaleString()
      }
      const updated = [recent, ...recentAnalyses].slice(0, 5)
      localStorage.setItem('recentAnalyses', JSON.stringify(updated))
      setRecentAnalyses(updated)
      
      router.push('/preview')
    } catch (e) {
      console.error('Failed to save dataset to sessionStorage', e)
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section style={{marginBottom: '3rem', paddingTop: '1rem'}}>
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <h1 style={{fontSize: '2.5rem', color: 'var(--light-mocha)', margin: '0 0 0.5rem 0'}}>📊 Data Quality Analysis</h1>
          <p style={{fontSize: '1.1rem', color: 'var(--warm-taupe)', margin: '0'}}>Instant AI-Powered Quality Insights</p>
        </div>

        {/* Upload Card */}
        <div className="card" style={{maxWidth: '600px', margin: '0 auto 2rem', padding: '2.5rem', textAlign: 'center'}}>
          <FileUpload onData={handleData} />
          <div style={{marginTop: '1rem', fontSize: '0.9rem', color: 'var(--warm-taupe)'}}>
            💡 Drag & drop file here or click to browse
          </div>
        </div>
      </section>

      {/* Recent Analyses Section */}
      {recentAnalyses.length > 0 && (
        <section style={{marginTop: '2rem', maxWidth: '700px', margin: '2rem auto'}}>
          <h2 style={{color: 'var(--light-mocha)', marginBottom: '1rem'}}>Recent Analyses</h2>
          <div className="card" style={{padding: '1.5rem'}}>
            <div style={{maxHeight: '200px', overflowY: 'auto'}}>
              {recentAnalyses.map((item) => (
                <div key={item.id} style={{
                  padding: '0.8rem',
                  borderBottom: '1px solid rgba(214,167,122,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.95rem'
                }}>
                  <div>
                    <div style={{color: 'var(--light-mocha)', fontWeight: 500}}>📋 {item.name}</div>
                    <div style={{color: 'var(--warm-taupe)', fontSize: '0.85rem'}}>
                      {item.rows} rows • {item.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p style={{fontSize: '0.85rem', color: 'var(--warm-taupe)', margin: '0.8rem 0 0 0', padding: '0 0.5rem'}}>
            💡 Quick Tip: Ensure column headers are in first row
          </p>
        </section>
      )}
    </div>
  )
}
