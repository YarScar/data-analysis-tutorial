export async function getAIInsights(payload) {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const json = await res.json()
    return json
  } catch (err) {
    return { error: String(err) }
  }
}
