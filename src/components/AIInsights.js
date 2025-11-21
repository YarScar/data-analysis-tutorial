import '../styles/AIInsights.css'

export default function AIInsights({ insights, column = null, analysis = null }) {

  if (insights?.error) {
    return (
      <div style={{ marginTop: 16 }}>
        <h3>AI Insights</h3>
        <p>Error: {insights.error}</p>
      </div>
    )
  }

  if (insights?.loading) {
    return (
      <div style={{ marginTop: 16 }}>
        <h3>AI Insights</h3>
        <p>Loading AI insights…</p>
      </div>
    )
  }

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
  } catch (e) {
    // ignore
  }

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
