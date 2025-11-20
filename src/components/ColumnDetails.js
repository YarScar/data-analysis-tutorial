"use client"
import { useRouter } from 'next/navigation'

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
                      <button type="button" onClick={() => {
                        try {
                          sessionStorage.setItem('selectedColumn', c)
                        } catch (e) { console.error(e) }
                        if (onRequestAI) onRequestAI(c)
                        else router.push('/insights')
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
