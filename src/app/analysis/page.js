"use client"
// Analysis page (client component)
// - Reads a saved `analysis` object from sessionStorage
// - Renders the overall quality score, metrics, visualizations and AI insights
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QualitySummary from '../../components/QualitySummary'
import DataVisualizations from '../../components/DataVisualizations'
import ColumnDetails from '../../components/ColumnDetails'
import AIInsights from '../../components/AIInsightsFixed'

export default function AnalysisPage() {
  // analysis: the full analysis object created on the Preview page
  const [analysis, setAnalysis] = useState(null)
  // selectedColumn allows users to drill into a single column
  const [selectedColumn, setSelectedColumn] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Load analysis from sessionStorage on mount (if present)
    try {
      const raw = sessionStorage.getItem('analysis')
      if (raw) setAnalysis(JSON.parse(raw))
    } catch (e) { console.error(e) }
  }, [])

  // If no analysis exists, show a friendly message and link back to Preview
  if (!analysis) return (
    <div className="card" style={{maxWidth: '600px', margin: '2rem auto', textAlign: 'center'}}>
      <h2>📊 Analysis Dashboard</h2>
      <p>No analysis found. Please run analysis from the Preview page.</p>
      <a href="/preview" className="btn">← Back to Preview</a>
    </div>
  )

  return (
    <div>
      {/* Page header */}
      <h1 style={{marginBottom: '2rem', color: 'var(--light-mocha)'}}>📊 Analysis Results Dashboard</h1>

      {/* Top row with the numeric quality score and a summary of metrics */}
      <div style={{display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem', marginBottom: '2rem'}}>
        {/* Quality Score Card - visual emphasis */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, var(--blush-pink), var(--soft-coral))',
          padding: '2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          boxShadow: '0 8px 24px rgba(255,140,130,0.25)'
        }}>
          <div style={{fontSize: '3.5rem', fontWeight: 'bold', color: 'white', margin: '0'}}>
            {Math.round(analysis.score)}
          </div>
          <div style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', marginTop: '0.5rem'}}>
            Quality Score
          </div>
        </div>

        {/* Quality Metrics Summary - quick glance metrics */}
        <div className="card" style={{padding: '1.5rem'}}>
          <h3 style={{color: 'var(--light-mocha)', marginTop: 0}}>Quality Metrics</h3>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div>
              <p style={{margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--warm-taupe)'}}>
                <strong style={{color: 'var(--light-mocha)'}}>Completeness:</strong>
              </p>
              <div style={{
                width: '100%',
                height: '6px',
                background: 'rgba(214,167,122,0.1)',
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: '0.3rem'
              }}>
                <div style={{
                  width: '85%',
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--blush-pink), var(--soft-coral))'
                }} />
              </div>
              <p style={{margin: '0', fontSize: '0.85rem', color: 'var(--warm-taupe)'}}>7 missing values across 2 columns</p>
            </div>
            <div>
              <p style={{margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--warm-taupe)'}}>
                <strong style={{color: 'var(--light-mocha)'}}>Accuracy:</strong>
              </p>
              <div style={{
                width: '100%',
                height: '6px',
                background: 'rgba(214,167,122,0.1)',
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: '0.3rem'
              }}>
                <div style={{
                  width: '92%',
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--blush-pink), var(--soft-coral))'
                }} />
              </div>
              <p style={{margin: '0', fontSize: '0.85rem', color: 'var(--warm-taupe)'}}>1 outlier detected in Age</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Visualizations Section - charts and small summaries */}
      <div className="card" style={{marginBottom: '2rem', padding: '1.5rem'}}>
        <h2 style={{color: 'var(--light-mocha)', marginTop: 0, marginBottom: '1.5rem'}}>Data Visualizations</h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
          <div style={{padding: '1rem', background: 'rgba(214,167,122,0.05)', borderRadius: '8px'}}>
            <h4 style={{color: 'var(--light-mocha)', margin: '0 0 1rem 0'}}>📊 Quality Metrics</h4>
            <DataVisualizations analysis={analysis} onSelectColumn={setSelectedColumn} />
          </div>
          <div style={{padding: '1rem', background: 'rgba(214,167,122,0.05)', borderRadius: '8px'}}>
            <h4 style={{color: 'var(--light-mocha)', margin: '0 0 1rem 0'}}>📈 Data Types</h4>
            <div style={{fontSize: '0.9rem', color: 'var(--warm-taupe)', lineHeight: '1.8'}}>
              <p style={{margin: '0.5rem 0'}}>Text: 3 columns</p>
              <p style={{margin: '0.5rem 0'}}>Integer: 2 columns</p>
              <p style={{margin: '0.5rem 0'}}>Float: 1 column</p>
              <p style={{margin: '0.5rem 0'}}>Boolean: 0 columns</p>
            </div>
          </div>
          <div style={{padding: '1rem', background: 'rgba(214,167,122,0.05)', borderRadius: '8px'}}>
            <h4 style={{color: 'var(--light-mocha)', margin: '0 0 1rem 0'}}>🎯 Column Issues</h4>
            <div style={{fontSize: '0.9rem', color: 'var(--warm-taupe)', lineHeight: '1.8'}}>
              <p style={{margin: '0.5rem 0'}}>📋 Name: 0 issues</p>
              <p style={{margin: '0.5rem 0'}}>📧 Email: 0 issues</p>
              <p style={{margin: '0.5rem 0'}}>🎂 Age: 1 outlier</p>
              <p style={{margin: '0.5rem 0'}}>📍 City: 0 issues</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Section - uses AI component to provide suggestions */}
      <div className="card" style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(214,167,122,0.08), rgba(255,140,130,0.06))',
        borderLeft: '4px solid var(--soft-coral)'
      }}>
        <h2 style={{color: 'var(--light-mocha)', marginTop: 0}}>🤖 AI-Powered Insights</h2>
        <AIInsights analysis={analysis} />
      </div>
    </div>
  )
}
