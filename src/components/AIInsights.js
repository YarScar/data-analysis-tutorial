import { useEffect, useState } from 'react'
import { getAIInsights } from '../lib/aiIntegration'

export default function AIInsights({ analysis, data }) {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true)
      try {
        const res = await getAIInsights({ analysis, sample: data.slice(0,5) })
        setInsights(res)
      } catch (err) {
        setInsights({ error: 'AI integration not configured or failed.' })
      } finally {
        setLoading(false)
      }
    }
    fetchInsights()
  }, [analysis])

  return (
    <div style={{marginTop: 16}} aria-live="polite">
      <h3>AI Insights</h3>
      {loading && <p role="status">Loading AI insights...</p>}
      {!loading && insights && (
        <div role="region" aria-label="AI insights">
          <pre style={{whiteSpace:'pre-wrap'}}>{insights.error ? insights.error : JSON.stringify(insights, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
