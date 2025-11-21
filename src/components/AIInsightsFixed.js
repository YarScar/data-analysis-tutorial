"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import '../styles/AIInsights.css'

export default function AIInsightsFixed({ insights, column = null, analysis = null }) {
  const router = useRouter()
  const [loadingCol, setLoadingCol] = useState(null)

  // If the component is used on the Analysis page without an `insights` payload,
  // expose per-column Ask AI controls so clicking will fetch AI and navigate.
  if (!insights && analysis && !column) {
    const cols = analysis.columnStats ? Object.keys(analysis.columnStats) : []

    async function askAIForColumn(c) {
      try {
        setLoadingCol(c)
        // Build a small sample from sessionStorage if available
        let sample = []
        try {
          const raw = sessionStorage.getItem('dataset')
          if (raw) {
            const ds = JSON.parse(raw)
            sample = Array.isArray(ds) ? ds.slice(0, 20) : []
          }
        } catch (e) { sample = [] }

        // POST to server AI route
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysis, sample, column: c })
        })
        const json = await res.json()
        const aiResult = json.normalized || json.parsed || { text: json.text }

        // attach to analysis and persist to sessionStorage
        const updated = { ...(analysis || {}), columnAI: { ...(analysis.columnAI || {}), [c]: aiResult } }
        try { sessionStorage.setItem('analysis', JSON.stringify(updated)) } catch (e) { /* ignore */ }
        try { sessionStorage.setItem('selectedColumn', c) } catch (e) { /* ignore */ }

        // navigate to insights where cached AI result will be rendered immediately
        router.push('/insights')
      } catch (err) {
        console.error('Ask AI failed', err)
        // still navigate so the Insights page can attempt a fetch there
        try { sessionStorage.setItem('selectedColumn', c) } catch (e) {}
        router.push('/insights')
      } finally {
        setLoadingCol(null)
      }
    }

    return (
      <section style={{ marginTop: 12 }}>
        <h3>AI-Powered Insights</h3>
        <p style={{marginTop:8}}>Ask the AI for a specific column to get detailed recommendations and fixes.</p>
        <div style={{display:'grid', gap:8, marginTop:12}}>
          {cols.map((c) => (
            <div key={c} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px', borderRadius:6, background:'#fff'}}>
              <div style={{fontSize:14}}>{c}</div>
              <div>
                <button className="btn" onClick={() => askAIForColumn(c)} disabled={loadingCol === c}>{loadingCol === c ? 'Asking…' : 'Ask AI'}</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  // When used on the Insights page with an `insights` payload, render details
  if (insights?.error) return (
    <div style={{ marginTop: 16 }}>
      <h3>AI Insights</h3>
      <p>Error: {insights.error}</p>
    </div>
  )

  if (insights?.loading) return (
    <div style={{ marginTop: 16 }}>
      <h3>AI Insights</h3>
      <p>Loading AI insights…</p>
    </div>
  )

  const parsed = insights?.normalized ?? insights?.parsed ?? null
  const rawText = insights?.text ?? null

  let issuesCount = 0
  try {
    if (parsed && Array.isArray(parsed.recommendations)) issuesCount += parsed.recommendations.length
    if (column && (column.missingCount || column.missingPercent)) {
      const miss = column.missingCount || 0
      if (miss > 0 || (column.missingPercent && column.missingPercent > 0)) issuesCount += 1
    }
    if (analysis && analysis.outliers && column && analysis.outliers[column.column] && analysis.outliers[column.column].count > 0) issuesCount += 1
  } catch (e) {}

  return (
    <section style={{ marginTop: 16 }} aria-live="polite">
      <h3>Detailed Insights {column ? '- ' + column.column : ''}</h3>
      <div style={{ fontSize: 14, marginTop: 8 }}>
        <div><strong>Issues:</strong> {issuesCount}</div>
        <div style={{ marginTop: 12 }}>
          <strong>Analysis Details</strong>
          <div style={{ marginTop: 6 }}>
            {column ? (
              <div>
                <div>Type: {column.type ?? 'unknown'}</div>
                <div>Missing: {column.missingCount ?? 0} ({String(column.missingPercent ?? 0)}%)</div>
                <div>Unique: {column.uniqueCount ?? '—'}</div>
              </div>
            ) : (
              <div>No column analysis available.</div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Suggested Fixes</strong>
          <div style={{ marginTop: 6 }}>
            {parsed && Array.isArray(parsed.recommendations) ? (
              <ol>
                {parsed.recommendations.map((r, i) => (
                  <li key={i}>{typeof r === 'string' ? r : r.step} ({(r && r.severity) || 'medium'})</li>
                ))}
              </ol>
            ) : rawText ? (
              <pre style={{ whiteSpace: 'pre-wrap' }}>{rawText}</pre>
            ) : (
              <div>No recommendations returned by the AI.</div>
            )}
          </div>
        </div>

        {parsed && parsed.notes && (
          <div style={{ marginTop: 12 }}>
            <strong>Notes:</strong>
            <div>{parsed.notes}</div>
          </div>
        )}
      </div>
    </section>
  )
}
