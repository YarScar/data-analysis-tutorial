"use client"
import { useRouter } from 'next/navigation'
import '../styles/ColumnDetails.css'

export default function ColumnDetails({ analysis, selectedColumn, onSelectColumn, onRequestAI }) {
  if (!analysis || !analysis.columnStats) return null

  const router = useRouter()

  const cols = Object.keys(analysis.columnStats)

  return (
    <section style={{marginTop:16}} aria-label="Column details">
      <h3>Column Details</h3>
      <div style={{overflowX:'auto'}}>
        <table>
          <thead>
            <tr>
              <th>Column</th>
              <th>Type</th>
              <th>Missing %</th>
              <th>Unique</th>
              <th>Sample</th>
              <th>Outliers</th>
            </tr>
          </thead>
          <tbody>
            {cols.map((c) => {
              const s = analysis.columnStats[c]
              const out = analysis.outliers && analysis.outliers[c] ? analysis.outliers[c].count : 0
              const isSelected = selectedColumn === c
              return (
                <tr key={c} style={isSelected ? {background: '#eef'} : {}} aria-current={isSelected ? 'true' : undefined}>
                  <td>{c}</td>
                  <td>{s.type}</td>
                  <td>{s.missingPercent ?? 0}%</td>
                  <td>{s.uniqueCount}</td>
                  <td>{(s.sampleValues || []).join(', ')}</td>
                  <td>{out}</td>
                  <td>
                    <button type="button" onClick={() => onSelectColumn && onSelectColumn(c)}>View</button>
                      <button type="button" onClick={async () => {
                        // Save selected column and analysis snapshot first
                        try {
                          sessionStorage.setItem('selectedColumn', c)
                          try { sessionStorage.setItem('analysis', JSON.stringify(analysis)) } catch (e) { /* ignore */ }
                        } catch (e) { console.error(e) }

                        // If a parent provided an onRequestAI hook, call it
                        if (onRequestAI) {
                          try { onRequestAI(c) } catch (e) { console.error(e) }
                        }

                        // Attempt to call the AI endpoint now so Insights page has cached result
                        try {
                          // build small sample from sessionStorage dataset
                          let sample = []
                          try {
                            const raw = sessionStorage.getItem('dataset')
                            if (raw) {
                              const ds = JSON.parse(raw)
                              sample = Array.isArray(ds) ? ds.slice(0, 20) : []
                            }
                          } catch (e) { sample = [] }

                          const res = await fetch('/api/ai', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ analysis, sample, column: c })
                          })
                          const json = await res.json()
                          const aiResult = json.normalized || json.parsed || { text: json.text }

                          // attach to analysis and persist
                          const updated = { ...(analysis || {}), columnAI: { ...(analysis.columnAI || {}), [c]: aiResult } }
                          try { sessionStorage.setItem('analysis', JSON.stringify(updated)) } catch (e) { /* ignore */ }
                        } catch (err) {
                          console.error('AI fetch failed before navigation', err)
                          // proceed anyway
                        }

                        // navigate to insights page
                        router.push('/insights')
                      }} style={{marginLeft:8}}>Ask AI</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
