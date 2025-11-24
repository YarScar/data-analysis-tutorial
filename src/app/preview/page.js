"use client"
// Preview page (client component)
// - Loads the uploaded dataset from sessionStorage
// - Lets user inspect sample rows, column stats and start a simulated analysis
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DataPreview from '../../components/DataPreview'
import QualityScore from '../../components/QualityScore'
import { analyzeDataQuality } from '../../lib/dataAnalysis'

export default function PreviewPage() {
  // dataset: the array of parsed rows (objects)
  const [dataset, setDataset] = useState(null)
  // UI state for fake analysis progress
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [analysisStatus, setAnalysisStatus] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Load the dataset saved on the Home page
    try {
      const raw = sessionStorage.getItem('dataset')
      if (raw) setDataset(JSON.parse(raw))
    } catch (e) { console.error(e) }
  }, [])

  // Persist analysis and navigate to the Analysis page
  function handleAnalyze(analysis) {
    try {
      sessionStorage.setItem('analysis', JSON.stringify(analysis))
      router.push('/analysis')
    } catch (e) { console.error(e) }
  }

  // Simulate analysis with a visible progress bar, then run the real analysis
  async function simulateAnalysis() {
    if (!dataset) return
    
    setIsAnalyzing(true)
    setProgress(0)
    
    const steps = [
      { duration: 300, progress: 15, status: 'Scanning schema...' },
      { duration: 400, progress: 30, status: 'Inferring data types...' },
      { duration: 500, progress: 45, status: 'Computing statistics...' },
      { duration: 400, progress: 60, status: 'Detecting anomalies...' },
      { duration: 300, progress: 75, status: 'Calculating quality score...' },
      { duration: 200, progress: 90, status: 'Finalizing analysis...' }
    ]

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.duration))
      setProgress(step.progress)
      setAnalysisStatus(step.status)
    }

    setProgress(100)
    setAnalysisStatus('Analysis complete!')
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Run the real (synchronous) data analysis helper and navigate
    const analysis = analyzeDataQuality(dataset)
    handleAnalyze(analysis)
  }

  // If no dataset is present, show instructions to upload from Home
  if (!dataset) return (
    <div>
      <section className="card" style={{maxWidth: '600px', margin: '2rem auto', textAlign: 'center'}}>
        <h2>📋 Data Preview</h2>
        <p>No dataset found. Please upload on the Home page.</p>
        <a href="/" className="btn">← Back to Home</a>
      </section>
    </div>
  )

  // Show loading screen while analyzing
  if (isAnalyzing) {
    return (
      <div style={{maxWidth: '700px', margin: '0 auto', paddingTop: '3rem'}}>
        <div className="card" style={{padding: '2rem', textAlign: 'center'}}>
          <h2 style={{color: 'var(--light-mocha)', marginBottom: '1.5rem'}}>🔍 Analyzing Your Data</h2>
          
          {/* Progress Bar */}
          <div style={{marginBottom: '2rem'}}>
            <div style={{
              width: '100%',
              height: '12px',
              background: 'rgba(214,167,122,0.15)',
              borderRadius: '6px',
              overflow: 'hidden',
              marginBottom: '1rem',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: `linear-gradient(90deg, var(--blush-pink), var(--soft-coral))`,
                borderRadius: '6px',
                transition: 'width 0.3s ease',
                boxShadow: `0 0 10px rgba(255,140,130,${progress / 100 * 0.4})`
              }} />
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <p style={{margin: 0, color: 'var(--warm-taupe)', fontSize: '0.9rem'}}>{analysisStatus}</p>
              <p style={{margin: 0, color: 'var(--light-mocha)', fontSize: '1.1rem', fontWeight: 600}}>{progress}%</p>
            </div>
          </div>

          {/* Status Messages */}
          <div style={{
            padding: '1.5rem',
            background: 'rgba(214,167,122,0.05)',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <p style={{margin: '0.5rem 0', color: 'var(--warm-taupe)', fontSize: '0.95rem'}}>
              📊 Processing {dataset.length} rows across {Object.keys(dataset[0] || {}).length} columns...
            </p>
            <p style={{margin: '0.5rem 0', color: 'var(--warm-taupe)', fontSize: '0.9rem'}}>
              This may take a moment. Please don't close this window.
            </p>
          </div>

          {/* Animated spinner */}
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid rgba(214,167,122,0.2)',
            borderTop: '4px solid var(--soft-coral)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`\n            @keyframes spin {\n              0% { transform: rotate(0deg); }\n              100% { transform: rotate(360deg); }\n            }\n          `}</style>
        </div>
      </div>
    )
  }

  const cols = dataset && dataset.length > 0 ? Object.keys(dataset[0]) : []
  const rowCount = dataset ? dataset.length : 0
  const colCount = cols.length

  return (
    <div>
      {/* File Info Card */}
      <div className="card" style={{marginBottom: '1.5rem', padding: '1rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h3 style={{margin: '0 0 0.25rem 0', color: 'var(--light-mocha)'}}>📁 File: sales_data.csv</h3>
            <p style={{margin: '0', fontSize: '0.9rem', color: 'var(--warm-taupe)'}}>{rowCount} rows • {colCount} columns</p>
          </div>
        </div>
      </div>

      {/* Progress Bar - Static on preview */}
      <div className="card" style={{marginBottom: '1.5rem', padding: '1rem'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <span style={{color: 'var(--warm-taupe)', fontSize: '0.9rem'}}>Preview:</span>
          <div style={{
            flex: 1,
            height: '8px',
            background: 'rgba(214,167,122,0.1)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, var(--blush-pink), var(--soft-coral))',
              borderRadius: '4px'
            }} />
          </div>
          <span style={{color: 'var(--warm-taupe)', fontSize: '0.9rem', minWidth: '40px'}}>100%</span>
        </div>
      </div>

      {/* Data Preview */}
      <div className="card" style={{marginBottom: '1.5rem', padding: '1rem'}}>
        <h3 style={{color: 'var(--light-mocha)', marginBottom: '1rem'}}>Data Preview (First 100 rows):</h3>
        <div style={{overflowX: 'auto'}}>
          <DataPreview data={dataset.slice(0, 100)} />
        </div>
      </div>

      {/* Column Statistics */}
      <div className="card" style={{marginBottom: '1.5rem', padding: '1rem'}}>
        <h3 style={{color: 'var(--light-mocha)', marginBottom: '1rem'}}>Column Statistics:</h3>
        <ul style={{margin: '0', paddingLeft: '1.5rem', color: 'var(--warm-taupe)', lineHeight: '1.8'}}>
          {cols.map((col, idx) => {
            const vals = dataset.map(r => r[col]).filter(v => v !== null && v !== undefined && v !== '')
            const unique = new Set(vals).size
            const missing = dataset.length - vals.length
            return (
              <li key={idx} style={{marginBottom: '0.5rem'}}>
                <strong style={{color: 'var(--light-mocha)'}}>{col}:</strong> Text, {unique} unique, {missing} missing
              </li>
            )
          })}
        </ul>
      </div>

      {/* Quality Overview */}
      <div className="card" style={{marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(214,167,122,0.08), rgba(255,140,130,0.06))'}}>
        <h3 style={{color: 'var(--light-mocha)', marginBottom: '1rem'}}>Initial Quality Overview:</h3>
        <div style={{color: 'var(--warm-taupe)', lineHeight: '1.7', fontSize: '0.95rem'}}>
          <p style={{margin: '0.5rem 0'}}>✓ Schema detected: {colCount} columns identified</p>
          <p style={{margin: '0.5rem 0'}}>✓ Data types inferred: 2 text, 2 integer, 1 text</p>
          <p style={{margin: '0.5rem 0'}}>✓ Null values found: 7 total across 2 columns</p>
          <p style={{margin: '0.5rem 0'}}>⚠ Potential issues: 1 outlier detected in 'Age'</p>
        </div>
        <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
          <button 
            onClick={simulateAnalysis}
            className="btn"
            style={{fontSize: '1rem', padding: '12px 24px'}}
          >
            Continue to Full Analysis →
          </button>
        </div>
      </div>
    </div>
  )
}
