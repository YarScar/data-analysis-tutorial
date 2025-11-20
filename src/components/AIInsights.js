import { useEffect, useState } from 'react'

export default function AIInsights({ insights }) {
  if (!insights) return null

  // insights may contain { error } or { text, parsed }
  if (insights.error) {
    return <div style={{marginTop:16}}><h3>AI Insights</h3><p>Error: {insights.error}</p></div>
  }

  if (insights.loading) {
    return <div style={{marginTop:16}}><h3>AI Insights</h3><p>Loading AI insights…</p></div>
  }

  const { parsed, text } = insights

  return (
    <div style={{marginTop: 16}} aria-live="polite">
      <h3>AI Insights</h3>
      <div role="region" aria-label="AI insights">
        {parsed ? (
          <div>
            <p><strong>Summary:</strong> {parsed.summary}</p>
            {parsed.recommendations && (
              <div>
                <strong>Recommendations:</strong>
                <ul>
                  {parsed.recommendations.map((r, i) => (
                    <li key={i}>
                      {typeof r === 'string' ? r : (
                        <span>{r.step} <em style={{color:'#666'}}>({r.severity})</em></span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {parsed.notes && <p><strong>Notes:</strong> {parsed.notes}</p>}
          </div>
        ) : (
          <pre style={{whiteSpace:'pre-wrap'}}>{text}</pre>
        )}
      </div>
    </div>
  )
}
